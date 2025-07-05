import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { getWorkoutById, deleteWorkout } from '../utils/localStorage';

function WorkoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const foundWorkout = getWorkoutById(id);
        if (foundWorkout) {
          setWorkout(foundWorkout);
        } else {
          setError('Workout not found');
        }
      } catch (error) {
        console.error('Error loading workout:', error);
        setError('Failed to load workout');
      }
    };
    fetchWorkout();
  }, [id]);

  const handleDelete = async () => {
    try {
      deleteWorkout(id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting workout:', error);
      setError('Failed to delete workout');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Back to Home
        </Button>
      </Container>
    );
  }

  if (!workout) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Workout Details
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={() => navigate(`/add/${id}`)}
            sx={{ mr: 2 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {formatDate(workout.date)}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Bodyweight: {workout.bodyweight} lbs
        </Typography>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Exercises
      </Typography>

      <List>
        {workout.exercises.map((exercise) => (
          <Paper key={exercise.id} sx={{ mb: 2 }}>
            <ListItem>
              <ListItemText
                primary={exercise.name}
                secondary={
                  <>
                    <Typography component="span" variant="body2">
                      {exercise.weight === 'BW' ? 'Bodyweight' : `${exercise.weight} lbs`} × {exercise.reps} reps
                    </Typography>
                    {exercise.notes && (
                      <Typography component="p" variant="body2" color="text.secondary">
                        Notes: {exercise.notes}
                      </Typography>
                    )}
                  </>
                }
              />
            </ListItem>
          </Paper>
        ))}
      </List>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Workout</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this workout? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default WorkoutDetail; 