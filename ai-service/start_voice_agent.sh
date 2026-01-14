#!/bin/bash

# Voice Agent Startup Script
echo "🚀 Starting Voice Agent Server..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "📝 Please create a .env file with your GOOGLE_API_KEY"
    echo "   You can copy .env.example and fill in your API key"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -q -r requirements.txt

# Start the FastAPI server
echo "✅ Starting Voice Agent on http://localhost:8000"
echo "🎤 WebSocket endpoint: ws://localhost:8000/ws/voice-agent"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

uvicorn voice_free:app --host 0.0.0.0 --port 8000 --reload
