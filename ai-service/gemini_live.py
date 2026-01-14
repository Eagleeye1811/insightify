import os
import asyncio
import traceback
from google import genai
from dotenv import load_dotenv

load_dotenv()

class GeminiLiveClient:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            print("Error: GOOGLE_API_KEY not found in environment variables")
        
        self.client = genai.Client(api_key=self.api_key, http_options={"api_version": "v1beta"})
        self.model = "models/gemini-2.0-flash-exp"  # Using the experimental flash model for live capabilities

    async def connect(self, input_stream, output_queue):
        """
        Connects to the Gemini Live API.
        
        Args:
            input_stream: An async generator yielding audio bytes from the client.
            output_queue: An asyncio.Queue to put audio bytes (or messages) to send back to client.
        """
        if not self.api_key:
             await output_queue.put({"error": "config_error", "message": "API Key missing"})
             return

        config = {"response_modalities": ["AUDIO"]}
        
        try:
            # Note: exact syntax depends on SDK version, assuming standard goog-genai pattern
            async with self.client.aio.live.connect(model=self.model, config=config) as session:
                print("Connected to Gemini Live API")
                
                async def send_audio_loop():
                    try:
                        async for data in input_stream:
                            if data is None:
                                break
                            # Send audio chunk
                            # Using "audio/pcm" or "application/pcm" depending on SDK expectations, often just raw bytes with mime_type
                            await session.send(input={"data": data, "mime_type": "audio/pcm"}, end_of_turn=True)
                    except Exception as e:
                        print(f"Error in send_audio_loop: {e}")

                async def receive_audio_loop():
                    try:
                        async for response in session.receive():
                            # The response structure depends on the SDK
                            # Typically response.data is the audio bytes if modality is AUDIO
                            if response.data:
                                await output_queue.put(response.data)
                            elif response.text:
                                # In case we get text debug info or fallback
                                pass
                    except Exception as e:
                        print(f"Error in receive_audio_loop: {e}")
                        # Don't break immediately on receive error, let session handle it or reconnect if needed?
                        # For now, just log.

                # Run both loops
                # We need to manage their lifecycle. 
                # If input stream closes, we might still want to receive pending audio.
                
                send_task = asyncio.create_task(send_audio_loop())
                receive_task = asyncio.create_task(receive_audio_loop())
                
                await asyncio.gather(send_task, receive_task)
                
        except Exception as e:
            print(f"Error connecting to Gemini Live: {e}")
            traceback.print_exc()
            await output_queue.put({"error": "connection_error", "message": str(e)})
