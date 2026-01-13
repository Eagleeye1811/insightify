# Insightify Play Store Scraper - Installation & Usage

## Prerequisites
- Node.js (v16+)
- Firebase Admin SDK credentials (or use default for local emulator)

## 1. Backend Setup

```bash
cd server
npm install
# Ensure .env has PORT=5001 or standard defaults
npm run dev
```

Server will start on `http://localhost:5001`.

## 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend will start on `http://localhost:5173`.

## 3. Usage

1. Open `http://localhost:5173/analyze`.
2. Enter an App Name (e.g., "Whatsapp") or Play Store URL.
3. Click **Analyze**.
4. The scraping job will run in the background (check backend console for logs).
5. You will be redirected to the Dashboard where data will load automatically.

## 4. Features Implemented

- **Proxy/Unofficial API Free**: Uses `google-play-scraper` directly.
- **Rate Limiting**: `p-queue` ensures max 1 request every 2s.
- **Caching**: Firestore stores data for 12 hours.
- **Background Jobs**: Asynchronous processing.
- **Data Normalization**: Cleans reviews and metadata.
