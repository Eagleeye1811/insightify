# 🤖 AI Model Fallback System

## Overview

The chatbot now has a **comprehensive 10-model fallback system** that automatically tries multiple Gemini models when one fails due to rate limits or other issues.

## How It Works

### 1. Model Priority System

Models are tried in order of reliability:

```javascript
Priority 1: Production-Ready (Highest reliability)
├── gemini-1.5-flash
└── gemini-1.5-flash-latest

Priority 2: Pro Models (Best quality)
├── gemini-1.5-pro
└── gemini-1.5-pro-latest

Priority 3: Legacy Models (Stable fallback)
├── gemini-pro
├── gemini-1.0-pro
└── gemini-1.0-pro-latest

Priority 4: Experimental (Different quotas)
├── gemini-2.0-flash-exp
├── gemini-exp-1206
└── gemini-exp-1121
```

### 2. Error Handling

The system intelligently handles different error types:

| Error Type | Action |
|------------|--------|
| 429 (Rate Limit) | Try next model immediately |
| Quota Exceeded | Try next model immediately |
| Timeout (30s) | Try next model |
| 404 (Not Found) | Skip to next model |
| Other Errors | Log and continue to next |

### 3. Fallback Cascade

```
User Question
    ↓
Try Model 1 (gemini-1.5-flash)
    ↓ (if fails)
Try Model 2 (gemini-1.5-flash-latest)
    ↓ (if fails)
Try Model 3 (gemini-1.5-pro)
    ↓ (if fails)
... (continue through all 10 models)
    ↓ (if ALL fail)
Use Intelligent Data-Aware Fallback
```

## Features

### ✅ Automatic Retry
- Tries 10 different models automatically
- No user intervention needed
- Seamless experience

### ✅ Smart Error Detection
- Detects rate limits
- Detects quota issues
- Detects timeouts
- Handles missing models

### ✅ Performance Optimized
- 30-second timeout per model
- Optimized generation config
- Efficient error handling

### ✅ Intelligent Fallback
When all models fail:
- Question-aware responses
- Uses actual review data
- Provides relevant insights
- No generic messages

## Generation Config

Each model uses optimized settings:

```javascript
{
  temperature: 0.7,    // Balanced creativity
  topK: 40,            // Token selection diversity
  topP: 0.95,          // Nucleus sampling
  maxOutputTokens: 1024 // Response length limit
}
```

## Logging

Detailed logs help track model usage:

```
🤖 [Attempt 1/10] Trying model: gemini-1.5-flash
✅ Success with model: gemini-1.5-flash (attempt 1)
```

Or on failure:
```
🤖 [Attempt 1/10] Trying model: gemini-1.5-flash
⚠️ Rate limit (429) for gemini-1.5-flash, trying next model...
🤖 [Attempt 2/10] Trying model: gemini-1.5-flash-latest
✅ Success with model: gemini-1.5-flash-latest (attempt 2)
```

## Benefits

### 1. **Higher Success Rate**
- 10 models = 10x chances of success
- Different models may have different quotas
- Experimental models often have separate limits

### 2. **Better User Experience**
- Automatic recovery from failures
- No manual intervention needed
- Seamless failover

### 3. **Resilience**
- Handles API issues gracefully
- Works during high-traffic periods
- Degrades gracefully to data-aware fallback

### 4. **Cost Optimization**
- Uses fastest models first
- Falls back to larger models only when needed
- Timeout prevents hanging requests

## When Fallback is Used

The system uses the intelligent fallback when:

1. ❌ All 10 models are rate-limited
2. ❌ API key is invalid
3. ❌ Network issues
4. ❌ Service outages

In these cases, you'll see:
```
❌ All AI models failed, using intelligent fallback
📊 Using data-aware fallback with 50 reviews
```

And get responses based on your actual data!

## Testing

### Test Model Fallback

```bash
# In one terminal
cd server
npm start

# In another terminal - send rapid requests
for i in {1..20}; do
  curl -X POST http://localhost:5001/chat \
    -H "Content-Type: application/json" \
    -d "{\"message\": \"Test $i\", \"userId\": \"test\"}"
  sleep 0.5
done
```

Watch the logs to see models being tried.

### Monitor Model Usage

Check logs for patterns like:
```
🤖 [Attempt 1/10] Trying model: gemini-1.5-flash
⚠️ Rate limit (429) for gemini-1.5-flash
🤖 [Attempt 2/10] Trying model: gemini-1.5-flash-latest
✅ Success with model: gemini-1.5-flash-latest
```

## Configuration

### Add More Models

Edit `ragService.js`:
```javascript
const MODELS_TO_TRY = [
  { name: "your-model-name", priority: 1 },
  // ... existing models
];
```

### Adjust Timeout

Change timeout duration:
```javascript
setTimeout(() => reject(new Error('Request timeout')), 30000) // 30 seconds
```

### Modify Generation Config

Update settings:
```javascript
generationConfig: {
  temperature: 0.7,      // 0-1 (higher = more creative)
  topK: 40,              // Token selection diversity
  topP: 0.95,            // Nucleus sampling threshold
  maxOutputTokens: 1024, // Max response length
}
```

## Troubleshooting

### All Models Still Failing?

**Check 1: API Key Valid?**
```bash
echo $GEMINI_API_KEY
```

**Check 2: Network Access?**
```bash
curl https://generativelanguage.googleapis.com/
```

**Check 3: Daily Quota?**
- Free tier: 1,500 requests/day
- Check: https://ai.google.dev/gemini-api/docs/models/gemini

### Models Timing Out?

Increase timeout:
```javascript
setTimeout(() => reject(new Error('Request timeout')), 60000) // 60 seconds
```

### Want Different Model Order?

Change priorities:
```javascript
{ name: "gemini-pro", priority: 1 },  // Try this first now
```

## Best Practices

1. ✅ **Monitor Logs** - Watch which models succeed/fail
2. ✅ **Track Usage** - Know your quota consumption
3. ✅ **Update API Key** - Rotate keys if hitting limits
4. ✅ **Test Fallback** - Ensure data-aware responses work
5. ✅ **Adjust Timeout** - Based on your needs

## Next Steps

1. ✅ **Restart server** to activate new system
2. ✅ **Test with questions** to see model fallback in action
3. ✅ **Monitor logs** to see which models work
4. 📋 **Get new API key** if all models are rate-limited
5. 📋 **Upgrade to paid tier** for higher limits (optional)

---

**Your chatbot now has 10x more resilience!** 🚀

Even if one model is rate-limited, it automatically tries 9 others before falling back to data-aware responses.
