import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import {
  getAllWorkoutsFromFirestore,
  addWorkoutToFirestore,
  updateWorkoutInFirestore,
  deleteWorkoutFromFirestore,
  getWorkoutByIdFromFirestore,
  subscribeToWorkouts,
  syncLocalStorageToFirestore
} from '../utils/firestoreUtils';
import {
  getAllWorkouts as getAllWorkoutsFromLocal,
  addWorkout as addWorkoutToLocal,
  updateWorkout as updateWorkoutInLocal,
  deleteWorkout as deleteWorkoutFromLocal,
  getWorkoutById as getWorkoutByIdFromLocal,
  clearAllWorkouts
} from '../utils/localStorage';

// Create the WorkoutDataContext
const WorkoutDataContext = createContext({});

// Custom hook to use the WorkoutDataContext
export function useWorkoutData() {
  const context = useContext(WorkoutDataContext);
  if (!context) {
    throw new Error('useWorkoutData must be used within a WorkoutDataProvider');
  }
  return context;
}

// WorkoutDataProvider component
export function WorkoutDataProvider({ children }) {
  const { currentUser, loading: authLoading } = useAuth();
  const { showError, showSuccess, showInfo } = useToast();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);

  // Clear error helper
  const clearError = () => setError('');

  // Load workouts based on auth state
  const loadWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      if (currentUser) {
        // User is logged in - load from Firestore
        const firestoreWorkouts = await getAllWorkoutsFromFirestore(currentUser.uid);
        setWorkouts(firestoreWorkouts);
      } else {
        // User not logged in - load from localStorage
        const localWorkouts = getAllWorkoutsFromLocal();
        setWorkouts(localWorkouts);
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
      setError('Failed to load workouts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Sync localStorage data to Firestore when user logs in
  const syncToFirestore = useCallback(async () => {
    if (!currentUser) return;

    try {
      setSyncing(true);
      const localWorkouts = getAllWorkoutsFromLocal();
      
      if (localWorkouts.length > 0) {
        showInfo(`Syncing ${localWorkouts.length} workout${localWorkouts.length !== 1 ? 's' : ''} to cloud...`);
        await syncLocalStorageToFirestore(currentUser.uid, localWorkouts);
        // Clear localStorage after successful sync
        clearAllWorkouts();
        showSuccess('Your local workouts have been synced to the cloud!');
      }
      
      // Reload from Firestore to get the synced data
      await loadWorkouts();
    } catch (error) {
      console.error('Error syncing to Firestore:', error);
      showError('Failed to sync your data to cloud storage. Your local data is safe.');
      setError('Failed to sync your data to cloud storage. Your local data is safe.');
    } finally {
      setSyncing(false);
    }
  }, [currentUser, loadWorkouts, showError, showSuccess, showInfo]);

  // Set up real-time listener for Firestore when user is logged in
  useEffect(() => {
    if (!currentUser || authLoading) return;

    let unsubscribe;
    
    const setupFirestoreListener = async () => {
      try {
        // First sync any local data to Firestore
        await syncToFirestore();
        
        // Then set up real-time listener
        unsubscribe = subscribeToWorkouts(currentUser.uid, (workouts, error) => {
          if (error) {
            console.error('Firestore listener error:', error);
            setError('Failed to sync workout data. Please refresh the page.');
          } else {
            setWorkouts(workouts);
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error setting up Firestore listener:', error);
        setError('Failed to connect to cloud storage.');
        setLoading(false);
      }
    };

    setupFirestoreListener();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser, authLoading, syncToFirestore]);

  // Load workouts when not logged in or when auth state changes
  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        // User not logged in - load from localStorage
        loadWorkouts();
      }
      // For logged in users, the Firestore listener handles data loading
    }
  }, [currentUser, authLoading, loadWorkouts]);

  // Add workout function
  const addWorkout = async (workout) => {
    try {
      setError('');
      
      if (currentUser) {
        // User is logged in - save to Firestore
        const newWorkout = await addWorkoutToFirestore(currentUser.uid, workout);
        showSuccess('Workout saved successfully!');
        // Firestore listener will update state automatically
        return newWorkout;
      } else {
        // User not logged in - save to localStorage
        const newWorkout = addWorkoutToLocal(workout);
        setWorkouts(prev => [newWorkout, ...prev.filter(w => w.id !== newWorkout.id)].sort((a, b) => new Date(b.date) - new Date(a.date)));
        showSuccess('Workout saved locally!');
        return newWorkout;
      }
    } catch (error) {
      console.error('Error adding workout:', error);
      const errorMessage = 'Failed to save workout. Please try again.';
      showError(errorMessage);
      setError(errorMessage);
      throw error;
    }
  };

  // Edit workout function
  const editWorkout = async (id, updatedWorkout) => {
    try {
      setError('');
      
      if (currentUser) {
        // User is logged in - update in Firestore
        const updated = await updateWorkoutInFirestore(currentUser.uid, id, updatedWorkout);
        showSuccess('Workout updated successfully!');
        // Firestore listener will update state automatically
        return updated;
      } else {
        // User not logged in - update in localStorage
        const updated = updateWorkoutInLocal(id, updatedWorkout);
        setWorkouts(prev => prev.map(w => w.id === id ? updated : w).sort((a, b) => new Date(b.date) - new Date(a.date)));
        showSuccess('Workout updated locally!');
        return updated;
      }
    } catch (error) {
      console.error('Error updating workout:', error);
      const errorMessage = 'Failed to update workout. Please try again.';
      showError(errorMessage);
      setError(errorMessage);
      throw error;
    }
  };

  // Delete workout function
  const deleteWorkout = async (id) => {
    try {
      setError('');
      
      if (currentUser) {
        // User is logged in - delete from Firestore
        await deleteWorkoutFromFirestore(currentUser.uid, id);
        showSuccess('Workout deleted successfully!');
        // Firestore listener will update state automatically
      } else {
        // User not logged in - delete from localStorage
        deleteWorkoutFromLocal(id);
        setWorkouts(prev => prev.filter(w => w.id !== id));
        showSuccess('Workout deleted!');
      }
      
      return id;
    } catch (error) {
      console.error('Error deleting workout:', error);
      const errorMessage = 'Failed to delete workout. Please try again.';
      showError(errorMessage);
      setError(errorMessage);
      throw error;
    }
  };

  // Get workout by ID function
  const getWorkoutById = async (id) => {
    try {
      if (currentUser) {
        // User is logged in - get from Firestore
        return await getWorkoutByIdFromFirestore(currentUser.uid, id);
      } else {
        // User not logged in - get from localStorage
        return getWorkoutByIdFromLocal(id);
      }
    } catch (error) {
      console.error('Error getting workout:', error);
      throw error;
    }
  };

  // Context value
  const value = {
    workouts,
    loading: loading || authLoading,
    error,
    syncing,
    addWorkout,
    editWorkout,
    deleteWorkout,
    getWorkoutById,
    clearError,
    refreshWorkouts: loadWorkouts
  };

  return (
    <WorkoutDataContext.Provider value={value}>
      {children}
    </WorkoutDataContext.Provider>
  );
} 