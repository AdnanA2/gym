import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Input,
  Paper
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';

const ImportData = ({ onImport }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success');

  const validateWorkoutData = (data) => {
    // Handle exported JSON format (with metadata) or direct array
    let workouts;
    if (Array.isArray(data)) {
      workouts = data;
    } else if (data && Array.isArray(data.workouts)) {
      workouts = data.workouts;
    } else {
      return { valid: false, error: 'Invalid JSON format. Expected an array of workouts or exported JSON with workouts array.' };
    }

    if (workouts.length === 0) {
      return { valid: false, error: 'No workouts found in the imported file.' };
    }

    // Validate each workout has required fields
    for (let i = 0; i < workouts.length; i++) {
      const workout = workouts[i];
      
      if (!workout.date) {
        return { valid: false, error: `Workout ${i + 1} is missing a date field.` };
      }
      
      if (!Array.isArray(workout.exercises)) {
        return { valid: false, error: `Workout ${i + 1} is missing exercises array.` };
      }

      // Validate each exercise
      for (let j = 0; j < workout.exercises.length; j++) {
        const exercise = workout.exercises[j];
        
        if (!exercise.name) {
          return { valid: false, error: `Exercise ${j + 1} in workout ${i + 1} is missing a name.` };
        }
        
        if (exercise.weight === undefined || exercise.weight === null) {
          return { valid: false, error: `Exercise "${exercise.name}" in workout ${i + 1} is missing weight.` };
        }
        
        if (exercise.reps === undefined || exercise.reps === null) {
          return { valid: false, error: `Exercise "${exercise.name}" in workout ${i + 1} is missing reps.` };
        }
      }
    }

    return { valid: true, workouts };
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage('');

    try {
      // Read file content
      const text = await file.text();
      
      // Parse JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        setMessage('Invalid JSON file. Please check the file format.');
        setSeverity('error');
        return;
      }

      // Validate data
      const validation = validateWorkoutData(data);
      if (!validation.valid) {
        setMessage(validation.error);
        setSeverity('error');
        return;
      }

      // Import data to localStorage
      const workouts = validation.workouts;
      
      // Convert dates to consistent format and ensure IDs exist
      const processedWorkouts = workouts.map(workout => ({
        ...workout,
        id: workout.id || `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: new Date(workout.date).toISOString(),
        exercises: workout.exercises.map(exercise => ({
          ...exercise,
          id: exercise.id || `exercise-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          notes: exercise.notes || ''
        }))
      }));

      // Save to localStorage
      localStorage.setItem('mentzer-workouts', JSON.stringify(processedWorkouts));
      
      setMessage(`Successfully imported ${processedWorkouts.length} workouts!`);
      setSeverity('success');
      
      // Call onImport callback if provided
      if (onImport) {
        onImport();
      }

    } catch (error) {
      console.error('Import error:', error);
      setMessage('An error occurred while importing the file. Please try again.');
      setSeverity('error');
    } finally {
      setLoading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Import from JSON
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Upload a previously exported JSON file to restore your workout data. 
        This will replace all current workout data.
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          disabled={loading}
          sx={{ display: 'none' }}
          id="json-file-input"
        />
        <label htmlFor="json-file-input">
          <Button
            variant="contained"
            component="span"
            startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            {loading ? 'Importing...' : 'Choose JSON File'}
          </Button>
        </label>
      </Box>

      {message && (
        <Alert severity={severity} sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}
    </Paper>
  );
};

export default ImportData; 