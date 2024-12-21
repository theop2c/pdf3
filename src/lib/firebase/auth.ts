import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from './index';
import { logger } from '../logger';

export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    logger.info('Attempting Google sign in');
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    logger.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    logger.error('Error signing out:', error);
    throw error;
  }
};