import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Button,
  Box,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getAllWorkouts } from '../utils/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function StatsPage() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [prs, setPrs] = useState({});

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const data = await getAllWorkouts();
        setWorkouts(data);
        calculatePRs(data);
      } catch (error) {
        console.error('Error fetching workouts:', error);
      }
    };
    fetchWorkouts();
  }, []);

  const calculatePRs = (workouts) => {
    const prMap = {};
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        const key = exercise.name;
        const score = exercise.weight === 'BW' ? 0 : exercise.weight * exercise.reps;
        if (!prMap[key] || score > prMap[key].score) {
          prMap[key] = {
            score,
            weight: exercise.weight,
            reps: exercise.reps,
            date: workout.date
          };
        }
      });
    });
    setPrs(prMap);
  };

  const chartData = {
    labels: workouts.map(w => new Date(w.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Bodyweight (kg)',
        data: workouts.map(w => w.bodyweight),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Bodyweight Progress'
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Workout Statistics
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bodyweight Progress
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line data={chartData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Personal Records
            </Typography>
            <List>
              {Object.entries(prs).map(([exercise, data], index) => (
                <div key={exercise}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemText
                      primary={exercise}
                      secondary={
                        <>
                          <Typography component="span" variant="body2">
                            {data.weight === 'BW' ? 'Bodyweight' : `${data.weight} kg`} × {data.reps} reps
                          </Typography>
                          <Typography component="p" variant="body2" color="text.secondary">
                            Achieved on {new Date(data.date).toLocaleDateString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                </div>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default StatsPage; 