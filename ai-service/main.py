from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from gemini_live import GeminiLiveClient
from pydantic import BaseModel
from rag_tool import query_reviews
import google.generativeai as genai
import os

app = FastAPI(title="Insightify AI Service")

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
        # Note: Using the synchronous generation for simplicity in this REST endpoint, 
        # but could be async if the client supports it.
        # Ensure GOOGLE_API_KEY is set in environment
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
             return {"response": "Error: Server misconfigured (missing API key)."}

        model = genai.GenerativeModel("gemini-2.0-flash-exp") 
        response = model.generate_content(prompt)
        
        return {"response": response.text}

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return {"response": "Sorry, I encountered an error processing your request."}


@app.websocket("/ws/agent")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected via WebSocket")
    
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
                # print(f"Sending audio to client: {len(data)} bytes")
                await websocket.send_bytes(data)
        except Exception as e:
            print(f"Error sending to client: {e}")

    try:
        await asyncio.gather(
            receive_audio_from_client(),
            send_audio_to_client(),
            gemini_task
        )
    except Exception as e:
        print(f"WebSocket session error: {e}")
        error_msg = str(e)
        if "quota" in error_msg.lower():
            reason = "Rate Limit Exceeded. Please change your API Key."
            try:
                await websocket.close(code=1011, reason=reason)
            except RuntimeError:
                pass # Already closed
        else:
             try:
                await websocket.close(code=1011, reason="Internal Server Error")
             except RuntimeError:
                pass
    finally:
        try:
            await websocket.close()
        except RuntimeError:
            pass
