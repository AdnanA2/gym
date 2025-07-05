import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Box,
  Fab,
  CircularProgress,
  Alert,
  Skeleton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getAllWorkouts } from '../utils/localStorage';

function Home() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        setError('');
        const data = getAllWorkouts();
        setWorkouts(data);
      } catch (error) {
        console.error('Error fetching workouts:', error);
        setError('Failed to load workouts. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkouts();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const LoadingSkeleton = () => (
    <>
      {Array.from(new Array(5)).map((_, index) => (
        <Paper key={index} sx={{ mb: 2, p: 2 }}>
          <Skeleton variant="text" width="30%" height={24} />
          <Skeleton variant="text" width="60%" height={20} />
        </Paper>
      ))}
    </>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Workouts
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/stats')}
          disabled={loading}
        >
          View Stats
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : workouts.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No workouts yet
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Start tracking your Mentzer-style workouts by adding your first workout.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/add')}
            sx={{ mt: 2 }}
          >
            Add Your First Workout
          </Button>
        </Paper>
      ) : (
        <List>
          {workouts.map((workout) => (
            <Paper
              key={workout.id}
              sx={{ 
                mb: 2, 
                cursor: 'pointer',
                transition: 'elevation 0.2s',
                '&:hover': {
                  elevation: 4
                }
              }}
              onClick={() => navigate(`/workout/${workout.id}`)}
            >
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="h6">
                      {formatDate(workout.date)}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      Bodyweight: {workout.bodyweight} lbs • {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                    </Typography>
                  }
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      )}

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/add')}
        disabled={loading}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
}

export default Home; 