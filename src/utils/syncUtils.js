import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Syncs workouts from localStorage to Firestore after login
 * Checks for duplicates and only adds new workouts
 * 
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<{synced: number, skipped: number, message: string}>} Summary of sync operation
 */
export const syncLocalWorkoutsToFirestore = async (userId) => {
  try {
    // Read workouts from localStorage
    const localWorkoutsJson = localStorage.getItem('mentzer-workouts');
    
    if (!localWorkoutsJson) {
      return {
        synced: 0,
        skipped: 0,
        message: 'No local workouts found to sync'
      };
    }

    const localWorkouts = JSON.parse(localWorkoutsJson);
    
    if (!Array.isArray(localWorkouts) || localWorkouts.length === 0) {
      return {
        synced: 0,
        skipped: 0,
        message: 'No valid local workouts found to sync'
      };
    }

    // Fetch existing workouts from Firestore subcollection
    const workoutsCollectionRef = collection(db, 'users', userId, 'workouts');
    const existingWorkoutsSnapshot = await getDocs(workoutsCollectionRef);
    
    const existingWorkouts = existingWorkoutsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    let syncedCount = 0;
    let skippedCount = 0;

    // Process each local workout
    for (const localWorkout of localWorkouts) {
      // Check if this workout already exists in Firestore
      const isDuplicate = existingWorkouts.some(existingWorkout => 
        areWorkoutsDuplicate(localWorkout, existingWorkout)
      );

      if (isDuplicate) {
        skippedCount++;
        continue;
      }

      // Prepare workout data for Firestore
      const workoutData = {
        date: localWorkout.date,
        bodyweight: localWorkout.bodyweight,
        exercises: localWorkout.exercises.map(exercise => ({
          name: exercise.name,
          weight: exercise.weight,
          reps: exercise.reps,
          notes: exercise.notes || ''
        })),
        createdAt: localWorkout.createdAt || new Date().toISOString(),
        syncedAt: new Date().toISOString()
      };

      // Add to Firestore
      await addDoc(workoutsCollectionRef, workoutData);
      syncedCount++;
    }

    // Clear localStorage workouts after successful sync
    localStorage.removeItem('mentzer-workouts');

    // Return summary
    const message = `${syncedCount} workouts synced, ${skippedCount} skipped due to duplicates`;
    
    return {
      synced: syncedCount,
      skipped: skippedCount,
      message
    };

  } catch (error) {
    console.error('Error syncing local workouts to Firestore:', error);
    throw new Error(`Failed to sync workouts: ${error.message}`);
  }
};

/**
 * Checks if two workouts are duplicates based on:
 * - Same date
 * - Same number of exercises
 * - Each exercise has same name, weight, and reps
 * 
 * @param {Object} workout1 - First workout to compare
 * @param {Object} workout2 - Second workout to compare
 * @returns {boolean} True if workouts are duplicates
 */
const areWorkoutsDuplicate = (workout1, workout2) => {
  // Compare dates (normalize to same format)
  const date1 = new Date(workout1.date).toISOString().split('T')[0];
  const date2 = new Date(workout2.date).toISOString().split('T')[0];
  
  if (date1 !== date2) {
    return false;
  }

  // Compare number of exercises
  if (workout1.exercises.length !== workout2.exercises.length) {
    return false;
  }

  // Sort exercises by name for consistent comparison
  const exercises1 = [...workout1.exercises].sort((a, b) => a.name.localeCompare(b.name));
  const exercises2 = [...workout2.exercises].sort((a, b) => a.name.localeCompare(b.name));

  // Compare each exercise
  for (let i = 0; i < exercises1.length; i++) {
    const ex1 = exercises1[i];
    const ex2 = exercises2[i];

    // Compare name, weight, and reps (the key identifying fields)
    if (
      ex1.name !== ex2.name ||
      ex1.weight !== ex2.weight ||
      ex1.reps !== ex2.reps
    ) {
      return false;
    }
  }

  return true;
}; 