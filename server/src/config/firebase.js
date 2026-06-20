import './env.js';
import admin from 'firebase-admin';

let _db = null;

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    console.log('Firebase initialized successfully');
    console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
  }
} catch (error) {
  console.error('Firebase initialization error:', error.message);
}

export const initializeFirebase = () => {};

export const getFirestore = () => {
  if (!_db) {
    _db = admin.firestore();
    _db.settings({ ignoreUndefinedProperties: true });
  }
  return _db;
};

export const getAuth = () => {
  return admin.auth();
};
