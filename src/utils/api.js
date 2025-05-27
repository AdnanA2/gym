import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { db } from '../firebase';

const WORKOUTS_COLLECTION = 'workouts';

export async function getAllWorkouts() {
  const workoutsQuery = query(
    collection(db, WORKOUTS_COLLECTION),
    orderBy('date', 'desc')
  );
  const querySnapshot = await getDocs(workoutsQuery);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date.toDate()
  }));
}

export async function addWorkout(workout) {
  const workoutWithTimestamp = {
    ...workout,
    date: Timestamp.fromDate(new Date(workout.date))
  };
  const docRef = await addDoc(collection(db, WORKOUTS_COLLECTION), workoutWithTimestamp);
  return { id: docRef.id, ...workout };
}

export async function updateWorkout(id, workout) {
  const workoutWithTimestamp = {
    ...workout,
    date: Timestamp.fromDate(new Date(workout.date))
  };
  const workoutRef = doc(db, WORKOUTS_COLLECTION, id);
  await updateDoc(workoutRef, workoutWithTimestamp);
  return { id, ...workout };
}

export async function deleteWorkout(id) {
  const workoutRef = doc(db, WORKOUTS_COLLECTION, id);
  await deleteDoc(workoutRef);
  return id;
} 