# RAG-Based Chatbot Implementation

## Overview

The Insightify chatbot now uses **RAG (Retrieval-Augmented Generation)** to provide accurate, data-driven responses based on actual app data stored in Firestore.

## Architecture

```
User Message
    ↓
┌─────────────────────────┐
│  Chat Controller        │
│  (chatController.js)    │
└──────────┬──────────────┘
           ↓
┌─────────────────────────┐
│  RAG Service            │
│  (ragService.js)        │
│                         │
│  1. Intent Analysis     │
│  2. Data Retrieval      │
│  3. Context Building    │
│  4. AI Generation       │
└──────────┬──────────────┘
           ↓
┌─────────────────────────┐
│  Firestore Collections  │
│  • apps                 │
│  • reviews              │
│  • analyses             │
│  • chat_logs            │
└─────────────────────────┘
```

## Key Components

### 1. RAG Service (`ragService.js`)

Main service handling the RAG pipeline:

- **Intent Analysis**: Detects what the user is asking about
- **Data Retrieval**: Fetches relevant data from Firestore
- **Context Building**: Constructs context from retrieved data
- **AI Generation**: Generates response using Gemini AI with context
- **Fallback Handling**: Provides helpful responses when no data available

### 2. Chat Controller (`chatController.js`)

Handles HTTP requests and responses:

- `POST /chat` - Main chat endpoint
- `GET /chat/history` - Retrieve chat history
- `DELETE /chat/history` - Clear chat history
- `GET /chat/stats` - Get chat statistics

### 3. Chat Routes (`chat.routes.js`)

Express routes for chat endpoints.

## Intent Detection

The system detects the following intents:

1. **reviewAnalysis** - Questions about reviews and feedback
2. **bugReport** - Bug-related queries
3. **featureRequest** - Feature request discussions
4. **sentiment** - Sentiment analysis questions
5. **stats** - Statistical queries
6. **comparison** - Comparative analysis
7. **recommendation** - Requesting recommendations
8. **general** - Default fallback

## Data Retrieval

### Firestore Collections Used:

#### `apps` Collection
```javascript
{
  userId: string,
  title: string,
  appId: string,
  genre: string,
  score: number,
  reviews: number,
  // ... other app metadata
}
```

#### `reviews` Collection
```javascript
{
  appId: string,
  score: number (1-5),
  text: string,
  date: timestamp,
  userName: string,
  // ... other review data
}
```

#### `analyses` Collection
```javascript
{
  appId: string,
  bugs: Array<{
    name: string,
    description: string,
    severity: string,
    frequency: number
  }>,
  features: Array<{
    name: string,
    type: string,
    frequency: number,
    impact: string
  }>,
  sentiment: {
    summary: string,
    keywords: Array<string>
  },
  recommendations: Array<Object>
}
```

#### `chat_logs` Collection (automatically created)
```javascript
{
  userId: string,
  message: string,
  response: string,
  intent: string,
  hasData: boolean,
  timestamp: string,
  dataUsed: {
    apps: number,
    reviews: number,
    hasAnalysis: boolean
  }
}
```

## Context Building

The RAG service builds rich context including:

1. **User's Apps List** - All apps owned by the user
2. **Recent Reviews** - Latest user feedback
3. **Analysis Results** - Bugs, features, sentiment from previous analyses
4. **Specific App Focus** - Detailed info if user mentions specific app

Example context structure:
```
# Available Data

## User's Apps:
- App Name (Genre)
  - Package: com.example.app
  - Current Rating: 4.5
  - Total Reviews: 1,234

## Recent Reviews (50 total):

### 5-Star Reviews (20):
- [2024-01-14] Great app, love the new features!
...

## Analysis Results:
### Bugs Found (3):
- Login Issue: Users report crashes on login (Severity: High)
...
```

## Fallback System

When no data is available, the system provides:

1. **Helpful Guidance** - How to add apps and get data
2. **General Advice** - Best practices for app development
3. **Contextual Suggestions** - Based on detected intent
4. **Encouragement** - Prompts to add apps for better insights

Example fallback responses are intent-specific and encouraging.

## Usage

### Backend Setup

1. **Environment Variables** (`.env`):
```env
GEMINI_API_KEY=your_gemini_api_key
PORT=5001
```

2. **Start Server**:
```bash
cd server
npm install
npm start
```

3. **Verify Endpoint**:
```bash
curl -X POST http://localhost:5001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What bugs are users reporting?", "userId": "test-user"}'
```

### Frontend Integration

The frontend (`Chatbot.jsx`) now:

1. Sends user ID with each request
2. Handles RAG responses with metadata
3. Shows better error messages
4. Uses correct endpoint (port 5001)

```javascript
const response = await fetch('http://localhost:5001/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        message: userMessage,
        userId: userId 
    }),
});
```

## Response Format

```javascript
{
  "response": "AI-generated response text",
  "intent": "reviewAnalysis",
  "hasData": true,
  "dataUsed": {
    "apps": 2,
    "reviews": 45,
    "hasAnalysis": true
  }
}
```

## Benefits of RAG Approach

### ✅ Advantages:

1. **Data-Driven Responses** - Answers based on actual user data
2. **Context-Aware** - Understands user's specific situation
3. **Scalable** - Handles multiple apps and large datasets
4. **Accurate** - Reduces AI hallucinations with factual data
5. **Personalized** - Tailored to each user's app portfolio
6. **Fallback-Ready** - Gracefully handles missing data

### 🎯 Use Cases:

- "What are the main bugs users are reporting?"
- "Show me sentiment trends for my app"
- "What features are users requesting?"
- "How many 1-star reviews did I get this month?"
- "Compare my two apps' performance"
- "What should I prioritize fixing first?"

## Testing

### Test with Mock Data:

1. **Add Test App**:
```javascript
await db.collection('apps').add({
    userId: 'test-user',
    title: 'Test App',
    appId: 'com.test.app',
    genre: 'Productivity',
    score: 4.2,
    reviews: 100
});
```

2. **Add Test Reviews**:
```javascript
await db.collection('reviews').add({
    appId: 'test-app-id',
    score: 5,
    text: 'Love this app! So useful.',
    date: new Date().toISOString()
});
```

3. **Test Chat**:
```bash
curl -X POST http://localhost:5001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What do users like about my app?",
    "userId": "test-user"
  }'
```

## Error Handling

The system handles errors gracefully:

1. **No Data Available** → Fallback responses
2. **AI Service Down** → Retry with different models
3. **Firestore Error** → Empty data arrays, continue
4. **Invalid Input** → Validation error messages
5. **Network Issues** → User-friendly error messages

## Performance Optimization

1. **Caching** - Model instance cached after first use
2. **Pagination** - Limited data retrieval (50 reviews max)
3. **Indexing** - Firestore indexes for fast queries
4. **Batching** - Batch operations where possible
5. **Lazy Loading** - Model loaded only when needed

## Security Considerations

1. **User Isolation** - Users only access their own data
2. **Input Validation** - All inputs validated
3. **Rate Limiting** - Should be added for production
4. **API Key Security** - Keys in environment variables
5. **Data Privacy** - No sensitive data in logs

## Future Enhancements

### Planned Features:

- [ ] Multi-turn conversations with memory
- [ ] Vector embeddings for semantic search
- [ ] Real-time data updates via WebSocket
- [ ] Suggested follow-up questions
- [ ] Export chat conversations
- [ ] Voice input/output integration
- [ ] Custom training on user's data
- [ ] A/B test recommendations
- [ ] Competitor analysis integration
- [ ] Trend prediction

### Advanced RAG Improvements:

- [ ] Semantic search with embeddings
- [ ] Query rewriting for better retrieval
- [ ] Multi-hop reasoning
- [ ] Citation of sources
- [ ] Confidence scores
- [ ] Fact-checking layer

## Monitoring

Key metrics to track:

1. **Response Quality** - User feedback on responses
2. **Data Usage** - Percentage of responses with data
3. **Intent Accuracy** - Correct intent detection rate
4. **Response Time** - Average latency
5. **Error Rate** - Failed requests percentage
6. **User Engagement** - Messages per session

## Troubleshooting

### Common Issues:

#### "No data available" responses
- **Cause**: User hasn't added apps yet
- **Solution**: Prompt user to add apps from Dashboard

#### Slow responses
- **Cause**: Large dataset or AI rate limits
- **Solution**: Implement caching, reduce data fetched

#### Generic responses despite having data
- **Cause**: Context not being used effectively
- **Solution**: Improve prompt engineering in RAG service

#### Connection errors
- **Cause**: Backend not running or wrong port
- **Solution**: Verify server running on port 5001

## Documentation Links

- [Google Gemini API](https://ai.google.dev/docs)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [RAG Best Practices](https://www.pinecone.io/learn/retrieval-augmented-generation/)

---

**Created:** 2026-01-14  
**Version:** 1.0.0  
**Status:** Production-Ready ✅
