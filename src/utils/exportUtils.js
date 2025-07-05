// Utility functions for exporting workout data

export const exportToCSV = (workouts) => {
  if (!workouts || workouts.length === 0) {
    throw new Error('No workout data to export');
  }

  // Create CSV header
  const csvHeader = 'Date,Bodyweight (kg),Exercise,Weight,Reps,Notes\n';

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
  let totalVolume = 0;
  let totalExercises = 0;

  workouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      const exerciseName = exercise.name.toLowerCase().trim();
      exerciseFrequency[exerciseName] = (exerciseFrequency[exerciseName] || 0) + 1;
      
      if (exercise.weight !== 'BW') {
        totalVolume += exercise.weight * exercise.reps;
      }
      totalExercises++;
    });
  });

  const mostFrequentExercise = Object.entries(exerciseFrequency).reduce(
    (max, [name, count]) => count > max.count ? { name, count } : max,
    { name: '', count: 0 }
  );

  return {
    totalWorkouts: workouts.length,
    totalExercises,
    totalVolume,
    averageExercisesPerWorkout: (totalExercises / workouts.length).toFixed(1),
    mostFrequentExercise: mostFrequentExercise.name || 'N/A',
    dateRange: {
      from: new Date(workouts[workouts.length - 1]?.date).toISOString(),
      to: new Date(workouts[0]?.date).toISOString()
    }
  };
}; 