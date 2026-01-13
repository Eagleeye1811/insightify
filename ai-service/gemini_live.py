import asyncio
import os
import json
import traceback
from typing import AsyncGenerator
import websockets
from websockets.exceptions import ConnectionClosed
from google import genai
from dotenv import load_dotenv

from rag_tool import query_reviews

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
MODEL = "gemini-2.0-flash-exp" # or specific live capable model

class GeminiLiveClient:
    def __init__(self):
        self.client = genai.Client(api_key=GOOGLE_API_KEY, http_options={"api_version": "v1alpha"})
        self.config = {
            "response_modalities": ["AUDIO"],
            "speech_config": {
                "voice_config": {"prebuilt_voice_config": {"voice_name": "Puck"}}
            }
        }

    async def connect(self, input_stream: AsyncGenerator[bytes, None], output_queue: asyncio.Queue):
        """
        Connects to Gemini Live, sends audio from input_stream, and puts responses into output_queue.
        """
        print(f"Connecting to Gemini Live model: {MODEL}")
        
        async with self.client.aio.live.connect(model=MODEL, config=self.config) as session:
            print("Connected to Gemini Live")

            # Initial System Instruction
            system_instruction = (
                "You are an expert Google Play Store App Growth Mentor. "
                "Your goal is to help app developers improve their app reviews, ratings, and revenue. "
                "You are analyzing a specific app called 'Insightify'. "
                "Speak concisely and professionally but with an encouraging tone. "
                "If asked about specific reviews or data, use the 'query_reviews' tool. "
                "Start by introducing yourself briefly."
            )
            await session.send(input=system_instruction, end_of_turn=True)

            # Task to receive from Gemini
            async def receive_from_gemini():
                while True:
                    try:
                        async for response in session.receive():
                            if response.server_content is None:
                                continue

                            model_turn = response.server_content.model_turn
                            if model_turn is not None:
                                for part in model_turn.parts:
                                    if part.inline_data is not None:
                                        # Audio data
                                        print(f"Received audio chunk: {len(part.inline_data.data)} bytes")
                                        await output_queue.put(part.inline_data.data)

                            turn_complete = response.server_content.turn_complete
                            if turn_complete:
                                print("Turn complete")

                            # Handle tool calls
                            # Note: The current live API client might handle tool calls differently.
                            # Usually checking for tool_call in parts.
                            # This is a simplified placeholder structure based on common patterns.
                            # We might need to inspect the 'tool_use' part specifically.
                            
                            # if response.tool_call:
                            #     for call in response.tool_calls:
                            #          if call.name == 'query_reviews':
                            #              result = query_reviews(**call.args)
                            #              await session.send_tool_response(result)

                    except Exception as e:
                        print(f"Error receiving from Gemini: {e}")
                        traceback.print_exc()
                        break

            # Task to send to Gemini
            async def send_to_gemini():
                try:
                    async for chunk in input_stream:
                        if chunk:
                            # Send raw audio bytes
                            # The SDK handles wrapping it in the correct payload
                            # print(f"Sending audio chunk: {len(chunk)} bytes")
                            await session.send(input={"data": chunk, "mime_type": "audio/pcm"}, end_of_turn=False)
                except Exception as e:
                     print(f"Error sending to Gemini: {e}")

            # Run both tasks
            await asyncio.gather(receive_from_gemini(), send_to_gemini())

