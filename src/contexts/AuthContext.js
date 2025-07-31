import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase';
import { syncLocalWorkoutsToFirestore } from '../utils/syncUtils';

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
  const [syncStatus, setSyncStatus] = useState(null); // Track sync status
  const [hasSyncedThisSession, setHasSyncedThisSession] = useState(false); // Prevent duplicate syncs

  // Clear error helper function
  const clearError = () => setError('');

  // Clear sync status helper function
  const clearSyncStatus = () => setSyncStatus(null);

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
      setSyncStatus(null);
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
      setSyncStatus({ loading: true, message: 'Syncing local workouts...' });
      
      const syncResult = await syncLocalWorkoutsToFirestore(user.uid);
      
      setSyncStatus({
        loading: false,
        success: true,
        ...syncResult
      });
      
      setHasSyncedThisSession(true);
      
      console.log('Workout sync completed:', syncResult);
      
      // Clear sync status after 5 seconds
      setTimeout(() => {
        setSyncStatus(null);
      }, 5000);
      
    } catch (error) {
      console.error('Workout sync failed:', error);
      setSyncStatus({
        loading: false,
        success: false,
        message: `Sync failed: ${error.message}`
      });
      
      // Clear error status after 10 seconds
      setTimeout(() => {
        setSyncStatus(null);
      }, 10000);
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
        await handleWorkoutSync(user);
      }
      
      // Reset sync session flag when user logs out
      if (!user) {
        setHasSyncedThisSession(false);
        setSyncStatus(null);
      }
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [currentUser]); // Add currentUser as dependency to track state changes

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    syncStatus,
    signup,
    login,
    logout,
    clearError,
    clearSyncStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 