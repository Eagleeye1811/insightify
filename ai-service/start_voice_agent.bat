@echo off
REM Voice Agent Startup Script for Windows

echo 🚀 Starting Voice Agent Server...

REM Check if .env file exists
if not exist .env (
    echo ❌ Error: .env file not found!
    echo 📝 Please create a .env file with your GOOGLE_API_KEY
    echo    You can create it manually with this content:
    echo    GOOGLE_API_KEY=your_google_api_key_here
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist venv (
    echo 📦 Creating virtual environment...
    python -m venv venv
    echo ✅ Virtual environment created
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📦 Installing dependencies...
pip install -q -r requirements.txt

REM Start the FastAPI server
echo ✅ Starting Voice Agent on http://localhost:8000
echo 🎤 WebSocket endpoint: ws://localhost:8000/ws/voice-agent
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn voice_free:app --host 0.0.0.0 --port 8000 --reload
