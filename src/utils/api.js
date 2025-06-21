import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy,
  where,
  Timestamp
} from "firebase/firestore";
import { db, auth } from '../firebase';

const WORKOUTS_COLLECTION = 'workouts';

// Helper function to get current user ID
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.uid;
};

export async function getAllWorkouts() {
  try {
    const userId = getCurrentUserId();
    const workoutsQuery = query(
      collection(db, WORKOUTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(workoutsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    }));
  } catch (error) {
    console.error('Error fetching workouts:', error);
    throw error;
  }
}

export async function addWorkout(workout) {
  try {
    const userId = getCurrentUserId();
    const workoutWithUserAndTimestamp = {
      ...workout,
      userId,
      date: Timestamp.fromDate(new Date(workout.date)),
      createdAt: Timestamp.now()
    };
    const docRef = await addDoc(collection(db, WORKOUTS_COLLECTION), workoutWithUserAndTimestamp);
    return { id: docRef.id, ...workout };
  } catch (error) {
    console.error('Error adding workout:', error);
    throw error;
  }
}

export async function updateWorkout(id, workout) {
  try {
    const userId = getCurrentUserId();
    const workoutWithTimestamp = {
      ...workout,
      userId,
      date: Timestamp.fromDate(new Date(workout.date)),
      updatedAt: Timestamp.now()
    };
    const workoutRef = doc(db, WORKOUTS_COLLECTION, id);
    await updateDoc(workoutRef, workoutWithTimestamp);
    return { id, ...workout };
  } catch (error) {
    console.error('Error updating workout:', error);
    throw error;
  }
}

export async function deleteWorkout(id) {
  try {
    const workoutRef = doc(db, WORKOUTS_COLLECTION, id);
    await deleteDoc(workoutRef);
    return id;
  } catch (error) {
    console.error('Error deleting workout:', error);
    throw error;
  }
} 