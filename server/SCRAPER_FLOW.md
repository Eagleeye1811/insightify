# Complete Scraper Flow Explanation

## 🔄 Full Flow (User Click → Dashboard Display)

### Step 1: User Searches for App
**Location:** `/analyze` page (`AnalyzeApp.jsx`)
- User enters "Spotify" or Play Store URL
- Clicks "Analyze" button

### Step 2: Frontend Sends Request
**Frontend:** `AnalyzeApp.jsx:20`
```javascript
POST http://localhost:5001/api/analyze
Body: { term: "spotify" }
```

### Step 3: Backend Receives Request
**Backend:** `scraperController.js` → `analyzeApp()`

#### 3a. Resolve App ID
- If URL → Extract `id` parameter
- If package name (com.spotify.music) → Use directly
- If app name → Search Play Store (via queue)
- **Result:** `com.spotify.music`

#### 3b. Check Cache
```javascript
db.collection('apps')
  .doc('com.spotify.music')
  .collection('config')
  .doc('cacheInfo')
```
- If exists AND < 12 hours old → Return cached data
- If NOT exists OR expired → Continue to scraping

#### 3c. Queue Scraping Job
```javascript
addJob(async () => {
  await performScrape(appId);
});
```
- Adds job to rate-limited queue
- Returns immediately: `{ status: 'processing', appId: 'com.spotify.music' }`

### Step 4: Frontend Redirects
**Frontend:** `AnalyzeApp.jsx:34`
```javascript
navigate(`/dashboard?appId=com.spotify.music`);
```

### Step 5: Dashboard Starts Polling
**Frontend:** `Dashboard.jsx` → `useEffect()`
- Detects `appId` in URL query params
- Starts polling every 3 seconds:
```javascript
GET http://localhost:5001/api/results/com.spotify.music
```

### Step 6: Background Scraping (Parallel)
**Backend:** `scraperController.js` → `performScrape()`

#### 6a. Fetch Data (via Queue)
All requests go through rate-limited queue (1 req/2s):
```javascript
// Request 1: App Details
gplay.app({ appId: 'com.spotify.music' })

// Request 2: Reviews (after 2s delay)
gplay.reviews({ 
  appId: 'com.spotify.music',
  num: 300 
})
```

#### 6b. Normalize Data
- Remove empty reviews
- Remove duplicates
- Set default version to "unknown"
- Clean text fields

#### 6c. Save to Firestore
```javascript
Batch Write:
/apps/com.spotify.music/data/metadata
/apps/com.spotify.music/data/reviews
/apps/com.spotify.music/config/cacheInfo
```

### Step 7: Dashboard Gets Data
**Frontend:** Dashboard polling succeeds
- Receives metadata + reviews
- Updates state
- Displays live data

## 📊 Data Flow Diagram

```
User Click "Analyze"
       ↓
Frontend: POST /api/analyze
       ↓
Backend: Resolve App ID
       ↓
Backend: Check Cache (Firestore)
       ↓
   [Cache Hit?]
    ↙     ↘
  YES      NO
   ↓        ↓
Return   Queue Job
Cache    (Background)
   ↓        ↓
   └────────┤
            ↓
Frontend: Redirect to /dashboard?appId=...
            ↓
Frontend: Poll GET /api/results/:appId (every 3s)
            ↓
       [Data Ready?]
        ↙     ↘
      YES      NO
       ↓       ↓
    Display  Show Loading
     Data    (Keep Polling)
```

## 🔧 Rate Limiting in Action

```
Time    Action
----    ------
0s      User clicks "Analyze"
0s      Search request → Queue
2s      App details request → Queue
4s      Reviews request → Queue
6s      Data saved to Firestore
6s      Dashboard poll succeeds
```

## 🗄️ Firestore Structure

```
/apps
  /com.spotify.music
    /data
      /metadata        (app info, rating, installs, etc.)
      /reviews         { list: [...300 reviews] }
    /config
      /cacheInfo       { lastUpdated: timestamp, version: "1.0" }
```

## ⚠️ Current Issue & Fix

**Problem:** Dashboard polls before scraping completes → `NOT_FOUND` error

**Solution:** Added try-catch in `getAppResults()` to return 404 gracefully, allowing Dashboard to keep polling until data is ready.
