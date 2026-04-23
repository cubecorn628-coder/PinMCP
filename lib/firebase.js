import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Mencegah re-inisialisasi di serverless environment
if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined;

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
      console.log('🔥 Firebase Admin initialized successfully.');
    } else {
      console.warn('⚠️ Firebase credentials not fully provided. Crash reporting will fallback to console.error.');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error.message);
  }
}

export const db = admin.apps.length ? admin.firestore() : null;
export { admin };
