import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Paper,
  Grid,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { v4 as uuidv4 } from 'uuid';
import { useWorkoutData } from '../contexts/WorkoutDataContext';

function AddWorkout() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addWorkout, editWorkout, getWorkoutById } = useWorkoutData();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [workout, setWorkout] = useState({
    date: new Date().toISOString().split('T')[0],
    bodyweight: '',
    exercises: [{ id: uuidv4(), name: '', weight: '', reps: '', notes: '' }]
  });

  // Load existing workout if editing
  useEffect(() => {
    if (id) {
      const loadWorkout = async () => {
        try {
          const existingWorkout = await getWorkoutById(id);
          if (existingWorkout) {
            setWorkout({
              ...existingWorkout,
              date: new Date(existingWorkout.date).toISOString().split('T')[0]
            });
          } else {
            setError('Workout not found');
          }
        } catch (error) {
          console.error('Error loading workout:', error);
          setError('Failed to load workout for editing');
        }
      };
      loadWorkout();
    }
  }, [id, getWorkoutById]);

  const handleExerciseChange = (index, field, value) => {
    const newExercises = [...workout.exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setWorkout({ ...workout, exercises: newExercises });
  };

  const addExercise = () => {
    setWorkout({
      ...workout,
      exercises: [...workout.exercises, { id: uuidv4(), name: '', weight: '', reps: '', notes: '' }]
    });
  };

  const removeExercise = (index) => {
    const newExercises = workout.exercises.filter((_, i) => i !== index);
    setWorkout({ ...workout, exercises: newExercises });
  };

  const validateWorkout = () => {
    if (!workout.date) return 'Date is required';
    if (!workout.bodyweight || isNaN(workout.bodyweight)) return 'Valid bodyweight is required';
    if (workout.exercises.length === 0) return 'At least one exercise is required';
    
    for (const exercise of workout.exercises) {
      if (!exercise.name) return 'Exercise name is required';
      if (!exercise.weight && exercise.weight !== 'BW') return 'Weight is required';
      if (!exercise.reps || isNaN(exercise.reps)) return 'Valid reps count is required';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateWorkout();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const workoutData = {
        ...workout,
        bodyweight: Number(workout.bodyweight),
        exercises: workout.exercises.map(ex => ({
          ...ex,
          weight: ex.weight === 'BW' ? 'BW' : Number(ex.weight),
          reps: Number(ex.reps)
        }))
      };

      if (id) {
        await editWorkout(id, workoutData);
      } else {
        await addWorkout(workoutData);
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving workout:', error);
      setError('Failed to save workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {id ? 'Edit Workout' : 'Add New Workout'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={workout.date}
                onChange={(e) => setWorkout({ ...workout, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Bodyweight (lbs)"
                value={workout.bodyweight}
                onChange={(e) => setWorkout({ ...workout, bodyweight: e.target.value })}
              />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Exercises
          </Typography>

          {workout.exercises.map((exercise, index) => (
            <Paper key={exercise.id} sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Exercise Name"
                    value={exercise.name}
                    onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Weight (lbs or BW)"
                    value={exercise.weight}
                    onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Reps"
                    value={exercise.reps}
                    onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <IconButton
                    color="error"
                    onClick={() => removeExercise(index)}
                    disabled={workout.exercises.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    value={exercise.notes}
                    onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}

          <Box sx={{ mt: 2, mb: 4 }}>
            <Button
              variant="outlined"
              onClick={addExercise}
              sx={{ mr: 2 }}
            >
              Add Exercise
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : (id ? 'Update Workout' : 'Save Workout')}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}

export default AddWorkout; 