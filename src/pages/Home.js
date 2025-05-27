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
  Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getAllWorkouts } from '../utils/api';

function Home() {
  const [workouts, setWorkouts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const data = await getAllWorkouts();
        setWorkouts(data);
      } catch (error) {
        console.error('Error fetching workouts:', error);
      }
    };
    fetchWorkouts();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Mentzer Workout Tracker
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/stats')}
        >
          View Stats
        </Button>
      </Box>

      <List>
        {workouts.map((workout) => (
          <Paper
            key={workout.id}
            sx={{ mb: 2, cursor: 'pointer' }}
            onClick={() => navigate(`/workout/${workout.id}`)}
          >
            <ListItem>
              <ListItemText
                primary={formatDate(workout.date)}
                secondary={`Bodyweight: ${workout.bodyweight} kg • ${workout.exercises.length} exercises`}
              />
            </ListItem>
          </Paper>
        ))}
      </List>

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/add')}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
}

export default Home; 