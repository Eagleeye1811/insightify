const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

// Initialize Firebase Admin with service account
let db, auth;

try {
    const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    console.log('✅ Firebase Admin Initialized Successfully');

    db = admin.firestore();
    auth = admin.auth();
} catch (error) {
    console.error('❌ Firebase Admin Initialization Failed:', error.message);
    console.error('Make sure serviceAccountKey.json exists in /server directory');
    process.exit(1); // Exit if Firebase fails - critical for this app
}


module.exports = { admin, db, auth };
