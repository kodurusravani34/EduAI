/**
 * ============================================
 *  AuthContext – Firebase Authentication
 * ============================================
 *  Provides real Firebase Auth state across the app.
 *  - Listens to onAuthStateChanged for persistent sessions
 *  - Provides login, signup, logout
 *  - Syncs with MongoDB user profile via backend API
 */

import { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as fbUpdateProfile,
  onAuthStateChanged,
} from '../config/firebase';
import { userAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);           // MongoDB user profile
  const [firebaseUser, setFirebaseUser] = useState(null); // Firebase user object
  const [loading, setLoading] = useState(true);

  // ─── Listen for Firebase auth state changes ───────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
          // Fetch or create the MongoDB user record via backend
          const res = await userAPI.getProfile();
          setUser(res.data);
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
          // User is authenticated with Firebase but backend may be down
          setUser({
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
            email: fbUser.email,
            firebaseUid: fbUser.uid,
          });
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Sign up with email & password.
   * Creates Firebase account, sets display name, then the backend
   * middleware auto-creates the MongoDB user on first API call.
   */
  const signup = async (name, email, password) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await fbUpdateProfile(credential.user, { displayName: name });
      const res = await userAPI.getProfile();
      setUser(res.data);
      return { success: true };
    } catch (error) {
      return { success: false, message: getFirebaseErrorMessage(error.code) };
    }
  };

  /**
   * Log in with email & password.
   */
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const res = await userAPI.getProfile();
      setUser(res.data);
      return { success: true };
    } catch (error) {
      return { success: false, message: getFirebaseErrorMessage(error.code) };
    }
  };

  /**
   * Log out – signs out of Firebase and clears local state.
   */
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setFirebaseUser(null);
  };

  /**
   * Update user preferences via backend API.
   */
  const updatePreferences = async (preferences) => {
    try {
      const res = await userAPI.updatePreferences(preferences);
      setUser(res.data);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  /**
   * Refresh user profile from backend.
   */
  const refreshProfile = async () => {
    try {
      const res = await userAPI.getProfile();
      setUser(res.data);
    } catch {
      // silent fail
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        login,
        signup,
        logout,
        updatePreferences,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Map Firebase error codes to user-friendly messages.
 */
function getFirebaseErrorMessage(code) {
  const messages = {
    'auth/email-already-in-use': 'This email is already registered. Try logging in.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return messages[code] || 'An unexpected error occurred. Please try again.';
}

/** Custom hook for consuming AuthContext */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
