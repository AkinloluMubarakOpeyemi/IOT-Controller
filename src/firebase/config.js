import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredKeys = [
  'apiKey',
  'authDomain',
  'databaseURL',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

const missingKeys = requiredKeys.filter((key) => {
  const value = firebaseConfig[key];
  return !value || String(value).includes('your_');
});

let app = null;
let auth = null;
let database = null;
let firebaseError = '';

if (missingKeys.length) {
  firebaseError = `Missing Firebase environment values: ${missingKeys.join(', ')}.`;
} else {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    database = getDatabase(app);
  } catch (error) {
    firebaseError = error?.message || 'Unable to initialize Firebase.';
  }
}

export { app, auth, database, firebaseError };
export const paths = {
  sensorData: 'sensorData',
  deviceControl: 'deviceControl',
  deviceStatus: 'deviceStatus',
  settings: 'settings',
  alerts: 'alerts',
  history: 'history',
};
