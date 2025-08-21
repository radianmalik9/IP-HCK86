import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase safely only when required env vars exist
const hasRequired = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let app = null;
try {
  if (hasRequired) {
    app = initializeApp(firebaseConfig);
  } else {
    if (import.meta && import.meta.env && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn('[firebase] Missing config. Google Sign-In disabled until VITE_FIREBASE_* are set.');
    }
  }
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('[firebase] initialization failed:', e?.message || e);
}

// Initialize Firebase services if app is available
export const auth = app ? getAuth(app) : null;
export const storage = app ? getStorage(app) : null;
export const analytics = (app && typeof window !== 'undefined' && firebaseConfig.measurementId)
  ? getAnalytics(app)
  : null;

export default app;
