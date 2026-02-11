import admin from 'firebase-admin';
import { logger } from '../utils/logger.js';

let firebaseApp = null;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      })
    });
    logger.info('Firebase initialized successfully');
  } catch (error) {
    logger.error('Firebase initialization error:', error);
  }
}

export const sendFirebaseOTP = async (phoneNumber) => {
  // Note: Firebase Phone Auth is typically handled on the client side
  // This is a placeholder for server-side verification if needed
  if (!firebaseApp) {
    logger.warn('Firebase not configured');
    return { success: false, message: 'Firebase not configured' };
  }
  
  // In production, OTP verification should be done client-side with Firebase SDK
  // Server-side can verify the ID token
  return { success: true, message: 'Use Firebase client SDK for OTP' };
};

export const verifyFirebaseToken = async (idToken) => {
  if (!firebaseApp) {
    throw new Error('Firebase not configured');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    logger.error('Firebase token verification error:', error);
    throw error;
  }
};
