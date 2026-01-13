from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from google import genai
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()
app = FastAPI(title="Free Voice Agent - Gemini Text API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"), http_options={"api_version": "v1beta"})

def log(message):
    """Helper to print timestamped logs"""
    timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
    print(f"[{timestamp}] {message}")

@app.websocket("/ws/voice-agent")
async def voice_agent(websocket: WebSocket):
    await websocket.accept()
    log("✅ Client connected to voice agent")
    
    try:
        while True:
            log("⏳ Waiting for user speech...")
            data = await websocket.receive_json()
            user_text = data.get("text", "")
            
            if not user_text:
                log("⚠️  Empty text received, skipping")
                continue
            
            log(f"📝 Received transcription: '{user_text}'")
            log("🤖 Sending to Gemini Text API...")
            
            response = client.models.generate_content(
                model="models/gemini-2.5-flash",
                contents=f"You are a Play Store app growth mentor. Be concise (1-2 sentences). User: {user_text}"
            )
            
            log(f"✅ Gemini response received: '{response.text[:50]}...'")
            log("📤 Sending response to client for speech synthesis")
            
            await websocket.send_json({"response": response.text})
            log("✅ Response sent successfully\n")
            
    except Exception as e:
        log(f"❌ Error: {e}")
    finally:
        log("👋 Client disconnected")
