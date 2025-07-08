import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

const WORKOUTS_COLLECTION = 'workouts';

// Get all workouts for a user
export const getAllWorkoutsFromFirestore = async (userId) => {
  try {
    const q = query(
      collection(db, WORKOUTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting workouts:', error);
    throw error;
  }
};

// Add a new workout
export const addWorkoutToFirestore = async (userId, workout) => {
  try {
    const workoutData = {
      ...workout,
      userId,
      createdAt: new Date().toISOString(),
      date: new Date(workout.date).toISOString()
    };
    
    const docRef = await addDoc(collection(db, WORKOUTS_COLLECTION), workoutData);
    return {
      id: docRef.id,
      ...workoutData
    };
  } catch (error) {
    console.error('Error adding workout:', error);
    throw error;
  }
};

// Update an existing workout
export const updateWorkoutInFirestore = async (userId, workoutId, updatedWorkout) => {
  try {
    const workoutRef = doc(db, WORKOUTS_COLLECTION, workoutId);
    const updateData = {
      ...updatedWorkout,
      userId,
      updatedAt: new Date().toISOString(),
      date: new Date(updatedWorkout.date).toISOString()
    };
    
    await updateDoc(workoutRef, updateData);
    return {
      id: workoutId,
      ...updateData
    };
  } catch (error) {
    console.error('Error updating workout:', error);
    throw error;
  }
};

// Delete a workout
export const deleteWorkoutFromFirestore = async (userId, workoutId) => {
  try {
    const workoutRef = doc(db, WORKOUTS_COLLECTION, workoutId);
    await deleteDoc(workoutRef);
    return workoutId;
  } catch (error) {
    console.error('Error deleting workout:', error);
    throw error;
  }
};

// Get a single workout by ID
export const getWorkoutByIdFromFirestore = async (userId, workoutId) => {
  try {
    const workoutRef = doc(db, WORKOUTS_COLLECTION, workoutId);
    const workoutDoc = await getDoc(workoutRef);
    
    if (workoutDoc.exists()) {
      const data = workoutDoc.data();
      if (data.userId === userId) {
        return {
          id: workoutDoc.id,
          ...data
        };
      } else {
        throw new Error('Workout not found or access denied');
      }
    } else {
      throw new Error('Workout not found');
    }
  } catch (error) {
    console.error('Error getting workout:', error);
    throw error;
  }
};

// Subscribe to real-time workout updates
export const subscribeToWorkouts = (userId, callback) => {
  try {
    const q = query(
      collection(db, WORKOUTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const workouts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(workouts, null);
    }, (error) => {
      console.error('Error in workout subscription:', error);
      callback(null, error);
    });
  } catch (error) {
    console.error('Error setting up workout subscription:', error);
    callback(null, error);
  }
};

// Sync localStorage workouts to Firestore
export const syncLocalStorageToFirestore = async (userId, localWorkouts) => {
  try {
    const batch = writeBatch(db);
    
    for (const workout of localWorkouts) {
      const workoutData = {
        ...workout,
        userId,
        createdAt: workout.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        date: new Date(workout.date).toISOString()
      };
      
      // Remove the local ID as Firestore will generate its own
      delete workoutData.id;
      
      const newWorkoutRef = doc(collection(db, WORKOUTS_COLLECTION));
      batch.set(newWorkoutRef, workoutData);
    }
    
    await batch.commit();
    console.log('Successfully synced local workouts to Firestore');
  } catch (error) {
    console.error('Error syncing to Firestore:', error);
    throw error;
  }
}; 