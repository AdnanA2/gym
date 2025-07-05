// Utility functions for exporting workout data

export const exportToCSV = (workouts) => {
  if (!workouts || workouts.length === 0) {
    throw new Error('No workout data to export');
  }

  // Create CSV header
  const csvHeader = 'Date,Bodyweight (lbs),Exercise,Weight,Reps,Notes\n';

  // Create CSV rows
  const csvRows = workouts.map(workout => {
    const date = new Date(workout.date).toISOString().split('T')[0];
    const bodyweight = workout.bodyweight;

    return workout.exercises.map(exercise => {
      const weight = exercise.weight === 'BW' ? 'Bodyweight' : exercise.weight;
      const notes = exercise.notes ? `"${exercise.notes.replace(/"/g, '""')}"` : '';
      
      return `${date},${bodyweight},"${exercise.name}",${weight},${exercise.reps},${notes}`;
    }).join('\n');
  }).join('\n');

  const csvContent = csvHeader + csvRows;
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `mentzer-workouts-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (workouts) => {
  if (!workouts || workouts.length === 0) {
    throw new Error('No workout data to export');
  }

  // Create export object with metadata
  const exportData = {
    exportDate: new Date().toISOString(),
    totalWorkouts: workouts.length,
    dateRange: {
      from: new Date(workouts[workouts.length - 1]?.date).toISOString(),
      to: new Date(workouts[0]?.date).toISOString()
    },
    workouts: workouts.map(workout => ({
      id: workout.id,
      date: new Date(workout.date).toISOString(),
      bodyweight: workout.bodyweight,
      exercises: workout.exercises.map(exercise => ({
        name: exercise.name,
        weight: exercise.weight,
        reps: exercise.reps,
        notes: exercise.notes || ''
      }))
    }))
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  
  // Create and download file
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `mentzer-workouts-${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateWorkoutSummary = (workouts) => {
  if (!workouts || workouts.length === 0) {
    return null;
  }

  const exerciseFrequency = {};
  const exerciseStats = {};
  let totalExercises = 0;
  let totalSets = 0;

  workouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      const exerciseName = exercise.name.toLowerCase().trim();
      exerciseFrequency[exerciseName] = (exerciseFrequency[exerciseName] || 0) + 1;
      
      // Track highest weight for each exercise
      if (!exerciseStats[exerciseName]) {
        exerciseStats[exerciseName] = {
          name: exercise.name,
          highestWeight: exercise.weight,
          bestReps: exercise.reps
        };
      } else {
        if (exercise.weight !== 'BW' && exerciseStats[exerciseName].highestWeight !== 'BW') {
          if (exercise.weight > exerciseStats[exerciseName].highestWeight) {
            exerciseStats[exerciseName].highestWeight = exercise.weight;
          }
        }
        if (exercise.reps > exerciseStats[exerciseName].bestReps) {
          exerciseStats[exerciseName].bestReps = exercise.reps;
        }
      }
      
      totalExercises++;
      totalSets++;
    });
  });

  const mostFrequentExercise = Object.entries(exerciseFrequency).reduce(
    (max, [name, count]) => count > max.count ? { name, count } : max,
    { name: '', count: 0 }
  );

  const uniqueExercises = Object.keys(exerciseFrequency).length;

  return {
    totalWorkouts: workouts.length,
    totalSets,
    uniqueExercises,
    averageSetsPerWorkout: (totalSets / workouts.length).toFixed(1),
    mostFrequentExercise: mostFrequentExercise.name || 'N/A',
    mostFrequentExerciseCount: mostFrequentExercise.count || 0,
    dateRange: {
      from: new Date(workouts[workouts.length - 1]?.date).toISOString(),
      to: new Date(workouts[0]?.date).toISOString()
    }
  };
}; 