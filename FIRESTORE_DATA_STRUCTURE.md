# Firestore Data Structure Documentation

## 📊 Overview
This document outlines all the data stored in Firebase Firestore for the Insightify platform.

---

## 🗄️ Collection Structure

### Root Collections

```
/users
  /{userId}
    /apps
      /{appId}
        /data
          /metadata
          /reviews
        /config
          /cacheInfo
```

---

## 📝 Detailed Schema

### 1. **Users Collection** (`/users`)

#### Purpose
Stores user-specific app analysis data. Each user has their own isolated data.

#### Structure
```
/users/{userId}
```
- `{userId}`: Firebase Auth UID (e.g., "abc123xyz")

---

### 2. **Apps Subcollection** (`/users/{userId}/apps`)

#### Purpose
Stores all apps analyzed by a specific user.

#### Structure
```
/users/{userId}/apps/{appId}
```
- `{appId}`: Google Play Store package name (e.g., "com.spotify.music")

---

### 3. **Data Subcollection** (`/users/{userId}/apps/{appId}/data`)

Contains the actual scraped data for each app.

#### 3.1 **Metadata Document** (`/data/metadata`)

**Purpose:** Stores app details and statistics from Google Play Store

**Fields:**
```javascript
{
  appId: "com.spotify.music",              // String - Package name
  title: "Spotify: Music and Podcasts",    // String - App name
  icon: "https://...",                      // String - App icon URL
  summary: "Music for everyone",            // String - Short description
  description: "Full description...",       // String - Long description
  score: 4.5,                               // Number - Average rating (0-5)
  scoreText: "4.5",                         // String - Rating as text
  ratings: 15000000,                        // Number - Total ratings count
  reviews: 5000000,                         // Number - Total reviews count
  histogram: {                              // Object - Rating distribution
    1: 500000,                              // Number - 1-star count
    2: 300000,                              // Number - 2-star count
    3: 800000,                              // Number - 3-star count
    4: 2000000,                             // Number - 4-star count
    5: 11400000                             // Number - 5-star count
  },
  price: 0,                                 // Number - Price (0 if free)
  free: true,                               // Boolean - Is free?
  currency: "USD",                          // String - Currency code
  developer: "Spotify AB",                  // String - Developer name
  url: "https://play.google.com/...",       // String - Play Store URL
  version: "8.9.0.123",                     // String - Current version
  updated: "2026-01-10",                    // String/Date - Last update
  genre: "Music & Audio",                   // String - App category
  installs: "1,000,000,000+"                // String - Install range
}
```

**Example:**
```javascript
{
  appId: "com.spotify.music",
  title: "Spotify: Music and Podcasts",
  icon: "https://play-lh.googleusercontent.com/...",
  summary: "Music for everyone",
  description: "Stream millions of songs...",
  score: 4.4,
  scoreText: "4.4",
  ratings: 15234567,
  reviews: 5123456,
  histogram: { 1: 512345, 2: 345678, 3: 876543, 4: 2345678, 5: 11154323 },
  price: 0,
  free: true,
  currency: "USD",
  developer: "Spotify AB",
  url: "https://play.google.com/store/apps/details?id=com.spotify.music",
  version: "8.9.0.123",
  updated: "Jan 10, 2026",
  genre: "Music & Audio",
  installs: "1,000,000,000+"
}
```

---

#### 3.2 **Reviews Document** (`/data/reviews`)

**Purpose:** Stores user reviews scraped from Google Play Store (max 300 reviews)

**Fields:**
```javascript
{
  list: [                                   // Array - List of reviews
    {
      id: "gp:AOqpTOH...",                  // String - Unique review ID
      userName: "John Doe",                 // String - Reviewer name
      userImage: "https://...",             // String - User avatar URL
      date: "2026-01-05T10:30:00.000Z",     // String/Date - Review date
      score: 5,                             // Number - Rating (1-5)
      text: "Great app! Love it.",          // String - Review text
      version: "8.9.0.123",                 // String - App version reviewed
      thumbsUp: 42                          // Number - Helpful count
    },
    // ... up to 300 reviews
  ]
}
```

**Example:**
```javascript
{
  list: [
    {
      id: "gp:AOqpTOHxyz123",
      userName: "Sarah Johnson",
      userImage: "https://play-lh.googleusercontent.com/a-/user123",
      date: "2026-01-10T14:23:45.000Z",
      score: 5,
      text: "Best music streaming app! The recommendations are spot on.",
      version: "8.9.0.123",
      thumbsUp: 156
    },
    {
      id: "gp:AOqpTOHabc456",
      userName: "Mike Chen",
      userImage: "https://play-lh.googleusercontent.com/a-/user456",
      date: "2026-01-09T09:15:30.000Z",
      score: 3,
      text: "Good app but drains battery quickly.",
      version: "8.8.5.100",
      thumbsUp: 89
    }
  ]
}
```

**Data Processing:**
- **Filtering:** Empty reviews are removed
- **Deduplication:** Duplicate reviews (by ID) are removed
- **Limit:** Maximum 300 reviews (sorted by newest)
- **Language:** English (en)
- **Country:** United States (us)

---

### 4. **Config Subcollection** (`/users/{userId}/apps/{appId}/config`)

Contains configuration and cache metadata.

#### 4.1 **Cache Info Document** (`/config/cacheInfo`)

**Purpose:** Tracks when data was last updated for cache management

**Fields:**
```javascript
{
  lastUpdated: Timestamp,                   // Firestore Timestamp - Last scrape time
  version: "1.0"                            // String - Data schema version
}
```

**Example:**
```javascript
{
  lastUpdated: Timestamp(seconds=1736697600, nanoseconds=0),  // 2026-01-12 20:00:00
  version: "1.0"
}
```

**Cache Logic:**
- **Cache Duration:** 12 hours
- **Validation:** Data is considered fresh if `lastUpdated` is less than 12 hours old
- **Behavior:** If cache is valid, return cached data; otherwise, trigger new scrape

---

## 🔄 Data Flow

### 1. **Scraping Process**

```
User Request → Resolve App ID → Check Cache
                                    ↓
                            [Cache Valid?]
                              ↙        ↘
                            YES         NO
                             ↓          ↓
                        Return Cache  Queue Scrape Job
                                          ↓
                                    Fetch from Play Store
                                          ↓
                                    Normalize Data
                                          ↓
                                    Save to Firestore
                                          ↓
                                    /data/metadata
                                    /data/reviews
                                    /config/cacheInfo
```

### 2. **Data Retrieval**

```
Frontend Request → Backend API → Firestore Query
                                      ↓
                              [Data Exists?]
                                ↙        ↘
                              YES         NO
                               ↓          ↓
                          Return Data   404 (Still Processing)
```

---

## 📈 Data Statistics

### Storage Estimates (Per App)

| Document | Estimated Size | Notes |
|----------|---------------|-------|
| `metadata` | ~2-5 KB | App details and statistics |
| `reviews` | ~100-300 KB | 300 reviews × ~1KB each |
| `cacheInfo` | ~100 bytes | Timestamp and version |
| **Total per app** | **~102-305 KB** | Varies by review count |

### Scalability

- **Per User:** Unlimited apps (subject to Firestore limits)
- **Per App:** 300 reviews max
- **Cache Duration:** 12 hours (configurable)
- **Concurrent Scrapes:** Rate-limited (1 request per 2 seconds)

---

## 🔐 Security Considerations

### Current Implementation

1. **User Isolation:** Each user's data is stored under their UID
2. **Authentication:** Requires Firebase Auth token (via `authMiddleware.js`)
3. **Access Control:** Users can only access their own data

### Recommended Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🛠️ API Endpoints

### 1. **Analyze App**
```
POST /api/analyze
Body: { term: "spotify" | "com.spotify.music" | "https://play.google.com/..." }
Response: { status: "processing" | "completed", appId: "com.spotify.music" }
```

### 2. **Get Results**
```
GET /api/results/:appId
Response: { 
  appId: "com.spotify.music",
  metadata: { ... },
  reviews: [ ... ]
}
```

---

## 📋 Example Complete Data Structure

```javascript
/users
  /abc123xyz                                    // User ID
    /apps
      /com.spotify.music                        // App ID
        /data
          /metadata                             // Document
            {
              appId: "com.spotify.music",
              title: "Spotify: Music and Podcasts",
              score: 4.4,
              ratings: 15234567,
              // ... (see Metadata section)
            }
          /reviews                              // Document
            {
              list: [
                {
                  id: "gp:AOqpTOH...",
                  userName: "Sarah Johnson",
                  score: 5,
                  text: "Best music app!",
                  // ... (see Reviews section)
                },
                // ... 299 more reviews
              ]
            }
        /config
          /cacheInfo                            // Document
            {
              lastUpdated: Timestamp(...),
              version: "1.0"
            }
```

---

## 🔄 Data Normalization

### Metadata Normalization
- Extract only essential fields from Play Store response
- Set default values (e.g., `version: "unknown"`)
- Preserve original data types

### Reviews Normalization
1. **Filter:** Remove reviews with empty text
2. **Clean:** Trim whitespace from text
3. **Deduplicate:** Remove duplicate reviews by ID
4. **Limit:** Keep only 300 most recent reviews
5. **Default:** Set `version: "unknown"` if missing

---

## 📊 Query Patterns

### Check if App Data Exists
```javascript
const appRef = db.collection('users').doc(userId).collection('apps').doc(appId);
const appDoc = await appRef.get();
if (appDoc.exists) {
  // Data exists
}
```

### Get Metadata
```javascript
const metaRef = db.collection('users')
  .doc(userId)
  .collection('apps')
  .doc(appId)
  .collection('data')
  .doc('metadata');
const metaSnap = await metaRef.get();
const metadata = metaSnap.data();
```

### Get Reviews
```javascript
const reviewsRef = db.collection('users')
  .doc(userId)
  .collection('apps')
  .doc(appId)
  .collection('data')
  .doc('reviews');
const reviewsSnap = await reviewsRef.get();
const reviews = reviewsSnap.data().list;
```

### Check Cache Validity
```javascript
const cacheRef = db.collection('users')
  .doc(userId)
  .collection('apps')
  .doc(appId)
  .collection('config')
  .doc('cacheInfo');
const cacheSnap = await cacheRef.get();
const cacheInfo = cacheSnap.data();
const isValid = (new Date() - cacheInfo.lastUpdated.toDate()) < (12 * 60 * 60 * 1000);
```

---

## 🎯 Future Enhancements

### Potential Additional Collections

1. **User Preferences** (`/users/{userId}/preferences`)
   - Dashboard settings
   - Notification preferences
   - Theme settings

2. **Analytics** (`/users/{userId}/apps/{appId}/analytics`)
   - Sentiment analysis results
   - Trend data
   - AI-generated insights

3. **Shared Reports** (`/reports/{reportId}`)
   - Shareable analysis reports
   - Public links
   - Collaboration features

---

## 📚 Related Documentation

- [SCRAPER_FLOW.md](./server/SCRAPER_FLOW.md) - Complete scraping workflow
- [FIREBASE_SETUP.md](./server/FIREBASE_SETUP.md) - Firebase configuration
- [TROUBLESHOOTING.md](./server/TROUBLESHOOTING.md) - Common issues and fixes
- [USAGE.md](./USAGE.md) - API usage guide
