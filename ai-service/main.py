from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from gemini_live import GeminiLiveClient
from pydantic import BaseModel
from rag_tool import query_reviews
from google import genai
import os
import time
from session_manager import SessionManager

app = FastAPI(title="Insightify AI Service")

# Initialize session manager
# Set is_paid=True if you've enabled billing on your Google Cloud project
session_manager = SessionManager(is_paid=False)  # Change to True after enabling billing

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Insightify AI Service (Gemini + RAG)"}

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        # 1. Retrieve relevant reviews from Firestore
        reviews = query_reviews(request.message)
        
        # 2. Construct context from reviews
        context_str = ""
        if reviews and isinstance(reviews, list):
            context_str = "\n".join([str(r) for r in reviews])
        
        # 3. Construct prompt
        prompt = f"""
        You are an expert app analyst. Answer the user's question based on the following app reviews:
        
        Context (Reviews):
        {context_str}
        
        User Question: {request.message}
        
        Please provide a helpful and concise answer.
        """
        
        # 4. Generate response using Gemini
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
             return {"response": "Error: Server misconfigured (missing API key)."}

        client = genai.Client(api_key=api_key, http_options={"api_version": "v1beta"})
        response = client.models.generate_content(model="models/gemini-2.5-flash", contents=prompt)
        
        return {"response": response.text}

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return {"response": "Sorry, I encountered an error processing your request."}


@app.websocket("/ws/agent")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected via WebSocket")
    
    # Check session limit before starting
    can_start, message = session_manager.can_start_session()
    if not can_start:
        status = session_manager.get_status()
        error_msg = f"{message}. Resets at: {status['resets_at']}. Enable billing for 50 sessions/day."
        print(f"❌ Session limit: {error_msg}")
        await websocket.close(code=4000, reason=error_msg)
        return
    
    # Record session start
    session_id = id(websocket)
    session_manager.start_session(session_id)
    print(f"✅ Session started. Status: {session_manager.get_status()}")
    
    gemini_client = GeminiLiveClient()
    input_queue = asyncio.Queue()
    output_queue = asyncio.Queue()

    async def mic_stream_generator():
        while True:
            try:
                data = await input_queue.get()
                if data is None:
                    break
                yield data
            except Exception:
                break
    
    # Start Gemini connection in background
    gemini_task = asyncio.create_task(gemini_client.connect(mic_stream_generator(), output_queue))

    async def receive_audio_from_client():
        try:
            while True:
                # Expecting raw bytes from client
                data = await websocket.receive_bytes()
                # print(f"Received audio from client: {len(data)} bytes")
                await input_queue.put(data)
        except WebSocketDisconnect:
            print("Client disconnected")
            await input_queue.put(None)
        except Exception as e:
            print(f"Error receiving from client: {e}")
            await input_queue.put(None)

    async def send_audio_to_client():
        try:
            while True:
                data = await output_queue.get()
                
                # Check if it's an error message
                if isinstance(data, dict) and data.get("error") == "quota_exceeded":
                    print(f"Quota exceeded, closing connection: {data.get('message')}")
                    await websocket.close(code=4000, reason="API Quota Exceeded. Please try again later or upgrade your plan.")
                    break
                
                # Otherwise it's audio data
                # print(f"Sending audio to client: {len(data)} bytes")
                await websocket.send_bytes(data)
        except Exception as e:
            print(f"Error sending to client: {e}")

    # Session monitoring task
    async def monitor_session_limit():
        start_time = time.time()
        # 3 minutes limit for free trial
        MAX_SESSION_DURATION = 180 
        
        while True:
            elapsed = time.time() - start_time
            if elapsed > MAX_SESSION_DURATION:
                print(f"Session limit reached for client {websocket.client}")
                # Optional: Send a text message or audio indicating limit reached if architecture supported it easily
                # For now, just close with specific code
                await websocket.close(code=4000, reason="Free Trial Limit Reached (3 mins). Upgrade to continue.")
                break
            await asyncio.sleep(1) # Check every second

    try:
        # Create tasks
        receive_task = asyncio.create_task(receive_audio_from_client())
        send_task = asyncio.create_task(send_audio_to_client())
        monitor_task = asyncio.create_task(monitor_session_limit())

        # Wait for any to finish (if monitor finishes, it means limit reached)
        done, pending = await asyncio.wait(
            [receive_task, send_task, gemini_task, monitor_task],
            return_when=asyncio.FIRST_COMPLETED
        )

        for task in pending:
            task.cancel()

        for task in done:
            if task.exception():
                raise task.exception()
            
    except Exception as e:
        error_msg = str(e)
        if "quota" in error_msg.lower() or "429" in error_msg:
             print(f"DEBUG: QUOTA ERROR DETECTED: {error_msg}")
             reason = "Gemini API Quota Exceeded. Try again later."
             try:
                await websocket.close(code=4000, reason=reason)
             except RuntimeError:
                pass 
        else:
             print(f"WebSocket session error: {e}")
             import traceback
             traceback.print_exc()
             try:
                await websocket.close(code=1011, reason=f"Internal Error: {str(e)[:50]}...")
             except RuntimeError:
                pass
    finally:
        # Record session end
        session_manager.end_session(session_id)
        print(f"Session ended. Remaining today: {session_manager.get_status()['sessions_remaining']}")
        
        try:
            await websocket.close()
        except RuntimeError:
            pass
