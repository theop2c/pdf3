import { create } from 'zustand';
import { db, auth } from '../lib/firebase';
import { signInWithGoogle, signOutUser } from '../lib/firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { Utilisateur as User } from '../types';
import { logger } from '../lib/logger';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
  initialized: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,
  initialized: false,

  initialize: () => {
    if (get().initialized) return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            set({ 
              user: userDoc.data() as User, 
              loading: false,
              initialized: true 
            });
          } else {
            set({ user: null, loading: false, initialized: true });
          }
        } else {
          set({ user: null, loading: false, initialized: true });
        }
      } catch (error) {
        logger.error('Auth state change error:', error);
        set({ 
          error: error as Error, 
          loading: false,
          initialized: true 
        });
      }
    });

    // Cleanup subscription on store destruction
    return () => unsubscribe();
  },

  signIn: async () => {
    try {
      set({ loading: true, error: null });
      logger.info('Attempting sign in');
      
      const firebaseUser = await signInWithGoogle();
      if (!firebaseUser) {
        set({ loading: false });
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        logger.info('Creating new user document');
        const newUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          role: 'gratuit',
          stockageUtilise: 0,
          nombreFichiers: 0,
          derniereMiseAJour: new Date(),
          jetonUtilises: {
            entree: 0,
            sortie: 0
          }
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        set({ user: newUser, loading: false, error: null });
      } else {
        logger.debug('User document exists, updating state');
        set({ 
          user: { ...userDoc.data(), id: userDoc.id } as User, 
          loading: false, 
          error: null 
        });
      }
    } catch (error) {
      logger.error('Sign in error:', error);
      set({ error: error as Error, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    try {
      logger.info('Attempting sign out');
      await signOutUser();
      set({ user: null, loading: false, error: null });
      logger.info('Sign out successful');
    } catch (error) {
      logger.error('Sign out error:', error);
      set({ error: error as Error, loading: false });
      throw error;
    }
  }
}));