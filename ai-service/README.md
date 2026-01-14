# 🎤 Insightify Voice Agent

Real-time voice conversation agent powered by Google's Gemini AI and Web Speech API.

## 🚀 Quick Start

### 1. Get Your Google API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

### 2. Setup Environment

```bash
# Navigate to ai-service directory
cd ai-service

# Create .env file from example
cp .env.example .env

# Edit .env and add your API key
# GOOGLE_API_KEY=your_actual_api_key_here
```

### 3. Start the Voice Agent Server

**Option A: Using the startup script (Recommended)**
```bash
chmod +x start_voice_agent.sh
./start_voice_agent.sh
```

**Option B: Manual start**
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn voice_free:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Use the Voice Agent

1. Make sure the server is running (step 3)
2. Open your Insightify app in the browser
3. Navigate to **Voice Agent** page
4. Click the microphone icon to start talking
5. Speak naturally - the AI will respond!

## 🎯 Features

- **Real-time Speech Recognition**: Uses browser's Web Speech API
- **AI-Powered Responses**: Powered by Google's Gemini 2.5 Flash
- **Voice Synthesis**: Browser reads AI responses aloud
- **Conversation History**: See full chat transcript
- **Summary Export**: Download conversation as Markdown
- **Voice Commands**: Say "cancel" or "end conversation" to stop

## 🔧 Technical Details

### Architecture

```
Frontend (React)
    ↓ (Speech Recognition)
User speaks → Transcription
    ↓ (WebSocket)
FastAPI Server (Python)
    ↓ (REST API)
Google Gemini AI
    ↓ (Response)
FastAPI Server
    ↓ (WebSocket)
Frontend → Speech Synthesis → User hears
```

### Ports

- **Voice Agent Server**: `http://localhost:8000`
- **WebSocket Endpoint**: `ws://localhost:8000/ws/voice-agent`
- **Frontend (Vite)**: `http://localhost:5173`
- **Backend (Node.js)**: `http://localhost:5001`

## 🐛 Troubleshooting

### "WebSocket connection failed"
**Problem**: Voice agent server is not running  
**Solution**: 
```bash
cd ai-service
./start_voice_agent.sh
```

### "GOOGLE_API_KEY not found"
**Problem**: Missing or invalid API key  
**Solution**:
1. Check that `.env` file exists in `ai-service/`
2. Verify your API key is correct
3. Restart the server after adding the key

### "Speech recognition not supported"
**Problem**: Browser doesn't support Web Speech API  
**Solution**: Use Chrome, Edge, or Safari (latest versions)

### "No microphone detected"
**Problem**: Browser can't access microphone  
**Solution**:
1. Allow microphone permission in browser
2. Check that microphone is connected
3. Try refreshing the page

### Dependencies installation fails
**Problem**: Missing Python or pip  
**Solution**:
```bash
# Install Python 3.8+ from python.org
# Or use package manager:
brew install python3  # macOS
apt install python3   # Ubuntu/Debian
```

## 📝 Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `GOOGLE_API_KEY` | Google AI API key for Gemini | Yes | `AIzaSy...` |

## 🔄 Development

### Running in Development Mode

```bash
# Terminal 1: Voice Agent Server
cd ai-service
./start_voice_agent.sh

# Terminal 2: Node.js Backend
cd server
npm run dev

# Terminal 3: React Frontend
cd client
npm run dev
```

### Testing the Voice Agent

1. Start the server
2. Open browser to `http://localhost:8000/docs`
3. Test the WebSocket endpoint using the interactive docs

## 📚 API Documentation

Once the server is running, visit:
- **Interactive API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## 🎨 Voice Commands

While chatting, you can say:
- **"cancel"** - End the conversation
- **"end conversation"** - End the conversation
- **"goodbye"** - End the conversation
- **"stop"** - End the conversation

## 🔐 Security Notes

- Never commit your `.env` file to git
- Keep your `GOOGLE_API_KEY` private
- The `.env.example` file is safe to commit

## 📦 Dependencies

- **FastAPI**: Web framework for the server
- **Uvicorn**: ASGI server
- **Google GenAI**: Google's AI SDK
- **Python Dotenv**: Environment variable management
- **WebSockets**: Real-time communication

## 🚀 Production Deployment

For production deployment:

1. Set proper CORS origins in `voice_free.py`
2. Use environment variables for configuration
3. Add rate limiting
4. Implement authentication
5. Use a production ASGI server (Gunicorn with Uvicorn workers)

## 📄 License

Part of the Insightify project.

## 🙋 Support

If you encounter issues:
1. Check this README's troubleshooting section
2. Verify all dependencies are installed
3. Ensure the server is running on port 8000
4. Check browser console for errors

---

**Happy Talking!** 🎤✨
