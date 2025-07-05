import { v4 as uuidv4 } from 'uuid';

const WORKOUTS_KEY = 'mentzer-workouts';

// Helper function to get all workouts from localStorage
const getWorkoutsFromStorage = () => {
  try {
    const workouts = localStorage.getItem(WORKOUTS_KEY);
    return workouts ? JSON.parse(workouts) : [];
  } catch (error) {
    console.error('Error reading workouts from localStorage:', error);
    return [];
  }
};

// Helper function to save workouts to localStorage
const saveWorkoutsToStorage = (workouts) => {
  try {
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
  } catch (error) {
    console.error('Error saving workouts to localStorage:', error);
    throw new Error('Failed to save workouts');
  }
};

// Get all workouts, sorted by date (newest first)
export const getAllWorkouts = () => {
  const workouts = getWorkoutsFromStorage();
  return workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Add a new workout
export const addWorkout = (workout) => {
  const workouts = getWorkoutsFromStorage();
  const newWorkout = {
    ...workout,
    id: uuidv4(),
    date: new Date(workout.date).toISOString()
  };
  
  workouts.push(newWorkout);
  saveWorkoutsToStorage(workouts);
  return newWorkout;
};

// Update an existing workout
export const updateWorkout = (id, updatedWorkout) => {
  const workouts = getWorkoutsFromStorage();
  const index = workouts.findIndex(w => w.id === id);
  
  if (index === -1) {
    throw new Error('Workout not found');
  }
  
  const workout = {
    ...updatedWorkout,
    id,
    date: new Date(updatedWorkout.date).toISOString()
  };
  
  workouts[index] = workout;
  saveWorkoutsToStorage(workouts);
  return workout;
};

// Delete a workout
export const deleteWorkout = (id) => {
  const workouts = getWorkoutsFromStorage();
  const filteredWorkouts = workouts.filter(w => w.id !== id);
  
  if (filteredWorkouts.length === workouts.length) {
    throw new Error('Workout not found');
  }
  
  saveWorkoutsToStorage(filteredWorkouts);
  return id;
};

// Get a single workout by ID
export const getWorkoutById = (id) => {
  const workouts = getWorkoutsFromStorage();
  return workouts.find(w => w.id === id);
};

// Clear all workouts (useful for testing or reset)
export const clearAllWorkouts = () => {
  localStorage.removeItem(WORKOUTS_KEY);
}; 