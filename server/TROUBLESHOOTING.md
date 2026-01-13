# Scraper Troubleshooting Guide

## Issue: Dashboard shows 404 "Data not found or still processing"

### What's Happening
The Dashboard is polling for results, but scraping is still in progress or hasn't completed.

### Timeline
1. User clicks "Analyze" → Backend starts scraping (background job)
2. Dashboard redirects and starts polling every 3 seconds
3. Scraping takes **15-20 seconds** with rate limits:
   - Search: 0-2s
   - App details: 2-4s  
   - Reviews (300): 4-8s
   - Save to Firestore: 8-10s
   - **Total: ~10-20 seconds**

### Solution
**Wait 20-30 seconds** after clicking "Analyze" before expecting data.

### How to Verify Scraping is Working

Check server logs for this sequence:
```
Analyzing: [app name]
Cache check failed for [appId], will scrape fresh data
Queueing scrape for [appId]
Starting scrape for [appId]...
  → Fetching app details...
  ✓ App details fetched: [App Name]
  → Fetching reviews...
  ✓ Reviews fetched: [count] reviews
  → Normalizing data...
  ✓ Data normalized: [count] unique reviews
  → Saving to Firestore...
✅ Scrape completed and saved for [appId]
```

### If Scraping Never Completes

**Common causes:**
1. **Server restarted mid-scrape** (nodemon)
2. **Network timeout** (Play Store unreachable)
3. **Invalid app ID** (app doesn't exist)
4. **Firestore permission error**

**Debug steps:**
1. Check server logs for errors
2. Try a popular app (e.g., "whatsapp")
3. Verify Firestore is enabled
4. Check network connection

## Issue: Cache not working

### Symptoms
- Same app triggers "processing" instead of "completed"
- No "Cache hit" message in logs

### Solution
Wait 30 seconds for first scrape to complete and save to Firestore.

### Verify Cache
1. Analyze an app (wait 30s)
2. Analyze the SAME app again
3. Should see: `Cache hit for [appId]` in logs
4. Response should be instant with `status: 'completed'`

## Issue: Rate Limiting / Getting Blocked

### Symptoms
- Scraping fails with network errors
- Empty responses from Play Store

### Current Protection
- ✅ 1 request every 2 seconds
- ✅ Max 300 reviews per app
- ✅ 12-hour cache
- ✅ Queue system

### If Still Getting Blocked
- Increase delay in `queueService.js`: `interval: 3000` (3 seconds)
- Reduce reviews: `num: 100` in `playStoreService.js`
- Wait longer between different app scrapes

## Quick Test

Run this to verify everything works:
```bash
cd server
node test-direct-scrape.js
```

Should show:
```
✅ App Details Success
✅ Reviews Success
✅ All scraping tests passed!
```
