// ============================================================
// KidneyHub - Firebase Configuration
// Project: kidneyhub-id
// App ID: 1:96952140150:web:a3ddbd8aaed1637cca3a57
// ============================================================

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Only initialize if API key is present (skips build-time evaluation)
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Database | null = null;

if (firebaseConfig.apiKey) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getDatabase(app);
}

export { auth, db };
export default app;

// ============================================================
// Analytics — lazy-loaded hanya di browser
// ============================================================
export async function initAnalytics() {
  if (typeof window === 'undefined' || !app) return null;
  const { getAnalytics, isSupported } = await import('firebase/analytics');
  if (!(await isSupported())) return null;
  return getAnalytics(app);
}
