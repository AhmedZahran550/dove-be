import * as admin from 'firebase-admin';
import { Logger } from '@nestjs/common';

const logger = new Logger('FirebaseConfig');

let firebaseApp: admin.app.App;

/**
 * Initialize Firebase Admin SDK
 * Uses Application Default Credentials (ADC) which automatically detects:
 * - Google Cloud Run service account (production)
 * - GOOGLE_APPLICATION_CREDENTIALS environment variable (local development)
 */
export function initializeFirebase(): admin.app.App {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });

    logger.log('Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK', error);
    throw error;
  }
}

/**
 * Get the initialized Firebase app instance
 */
export function getFirebaseApp(): admin.app.App {
  if (!firebaseApp) {
    return initializeFirebase();
  }
  return firebaseApp;
}

/**
 * Get Firestore instance
 */
export function getFirestore(): admin.firestore.Firestore {
  const app = getFirebaseApp();
  return admin.firestore(app);
}

export { admin };
