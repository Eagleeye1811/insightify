# Firebase Authentication Setup

## Current Issue

The backend is failing with error: **"Unable to detect a Project Id in the current environment"**

This happens because Firebase Admin SDK needs credentials to access Firestore.

## Solution Options

### Option 1: Use Your Firebase Project (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon) → **Service Accounts**
4. Click **"Generate New Private Key"**
5. Download the JSON file
6. Save it as `serviceAccountKey.json` in the `/server` directory
7. The code will automatically detect and use it

### Option 2: Use Firestore Emulator (Local Development)

If you want to develop locally without cloud credentials:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Run: `firebase init emulators` (select Firestore)
3. Start emulator: `firebase emulators:start`
4. I'll update the code to connect to the emulator

## Which Option?

Please let me know which option you prefer, and I'll configure the backend accordingly.
