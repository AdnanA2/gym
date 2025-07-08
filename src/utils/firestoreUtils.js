import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

// Get user's workouts collection reference
const getWorkoutsCollection = (userId) => {
  return collection(db, 'users', userId, 'workouts');
};

// Get all workouts for a user, sorted by date (newest first)
export const getAllWorkoutsFromFirestore = async (userId) => {
  try {
    const workoutsRef = getWorkoutsCollection(userId);
    const q = query(workoutsRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const workouts = [];
    querySnapshot.forEach((doc) => {
      workouts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return workouts;
  } catch (error) {
    console.error('Error fetching workouts from Firestore:', error);
    throw new Error('Failed to fetch workouts');
  }
};

// Add a new workout to Firestore
export const addWorkoutToFirestore = async (userId, workout) => {
  try {
    const workoutsRef = getWorkoutsCollection(userId);
    const newWorkout = {
      ...workout,
      date: new Date(workout.date).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(workoutsRef, newWorkout);
    return {
      id: docRef.id,
      ...newWorkout
    };
  } catch (error) {
    console.error('Error adding workout to Firestore:', error);
    throw new Error('Failed to add workout');
  }
};

// Update an existing workout in Firestore
export const updateWorkoutInFirestore = async (userId, workoutId, updatedWorkout) => {
  try {
    const workoutRef = doc(db, 'users', userId, 'workouts', workoutId);
    const workoutData = {
      ...updatedWorkout,
      date: new Date(updatedWorkout.date).toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(workoutRef, workoutData);
    return {
      id: workoutId,
      ...workoutData
    };
  } catch (error) {
    console.error('Error updating workout in Firestore:', error);
    throw new Error('Failed to update workout');
  }
};

// Delete a workout from Firestore
export const deleteWorkoutFromFirestore = async (userId, workoutId) => {
  try {
    const workoutRef = doc(db, 'users', userId, 'workouts', workoutId);
    await deleteDoc(workoutRef);
    return workoutId;
  } catch (error) {
    console.error('Error deleting workout from Firestore:', error);
    throw new Error('Failed to delete workout');
  }
};

// Get a single workout by ID from Firestore
export const getWorkoutByIdFromFirestore = async (userId, workoutId) => {
  try {
    const workoutRef = doc(db, 'users', userId, 'workouts', workoutId);
    const docSnap = await getDoc(workoutRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching workout from Firestore:', error);
    throw new Error('Failed to fetch workout');
  }
};

// Set up real-time listener for user's workouts
export const subscribeToWorkouts = (userId, callback) => {
  try {
    const workoutsRef = getWorkoutsCollection(userId);
    const q = query(workoutsRef, orderBy('date', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const workouts = [];
      querySnapshot.forEach((doc) => {
        workouts.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(workouts);
    }, (error) => {
      console.error('Error in workouts listener:', error);
      callback(null, error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up workouts listener:', error);
    throw new Error('Failed to set up workouts listener');
  }
};

// Sync localStorage workouts to Firestore (for migration when user logs in)
export const syncLocalStorageToFirestore = async (userId, localWorkouts) => {
  try {
    const workoutsRef = getWorkoutsCollection(userId);
    
    // Add each local workout to Firestore
    const syncPromises = localWorkouts.map(async (workout) => {
      const workoutData = {
        ...workout,
        // Remove the old UUID and let Firestore generate new ID
        // Keep the original date and data intact
        date: new Date(workout.date).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        migratedFromLocal: true
      };
      
      // Remove the old local ID since Firestore will generate a new one
      delete workoutData.id;
      
      return await addDoc(workoutsRef, workoutData);
    });
    
    await Promise.all(syncPromises);
    console.log(`Successfully synced ${localWorkouts.length} workouts to Firestore`);
    return true;
  } catch (error) {
    console.error('Error syncing localStorage to Firestore:', error);
    throw new Error('Failed to sync workouts to Firestore');
  }
}; 