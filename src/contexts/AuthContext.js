import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase';
import { syncLocalWorkoutsToFirestore } from '../utils/syncUtils';
import { useToast } from './ToastContext';

// Create the AuthContext
const AuthContext = createContext({});

// Custom hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// AuthProvider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasSyncedThisSession, setHasSyncedThisSession] = useState(false); // Prevent duplicate syncs
  
  const { showSuccess, showError, showInfo } = useToast();

  // Clear error helper function
  const clearError = () => setError('');

  // Signup function
  async function signup(email, password) {
    try {
      setError('');
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Login function
  async function login(email, password) {
    try {
      setError('');
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Logout function
  async function logout() {
    try {
      setError('');
      await signOut(auth);
      // Reset sync status when logging out
      setHasSyncedThisSession(false);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  // Handle workout sync after login
  const handleWorkoutSync = async (user) => {
    if (!user || hasSyncedThisSession) {
      return; // Skip if no user or already synced this session
    }

    try {
      console.log('Starting workout sync for user:', user.uid);
      showInfo('Syncing local workouts to cloud...');
      
      const syncResult = await syncLocalWorkoutsToFirestore(user.uid);
      
      setHasSyncedThisSession(true);
      
      console.log('Workout sync completed:', syncResult);
      
      // Show appropriate success message
      if (syncResult.synced > 0 || syncResult.skipped > 0) {
        showSuccess(syncResult.message);
      } else {
        showInfo(syncResult.message);
      }
      
    } catch (error) {
      console.error('Workout sync failed:', error);
      showError(`Workout sync failed: ${error.message}`);
    }
  };

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const wasUnauthenticated = !currentUser;
      setCurrentUser(user);
      setLoading(false);
      
      // If user just logged in (was unauthenticated and now has user), sync workouts
      if (user && wasUnauthenticated) {
        // Small delay to ensure UI has loaded before showing sync messages
        setTimeout(() => {
          handleWorkoutSync(user);
        }, 500);
      }
      
      // Reset sync session flag when user logs out
      if (!user) {
        setHasSyncedThisSession(false);
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [currentUser, showSuccess, showError, showInfo]); // Add toast functions as dependencies

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    signup,
    login,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 