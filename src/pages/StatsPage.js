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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Snackbar,
  IconButton,
  Menu,
  ListItemIcon,
  Chip
} from '@mui/material';
import {
  GetApp as DownloadIcon,
  MoreVert as MoreIcon,
  TrendingUp as TrendingUpIcon,
  FitnessCenter as FitnessCenterIcon,
  CalendarToday as CalendarIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
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
import { getAllWorkouts } from '../utils/localStorage';
import { exportToCSV, exportToJSON } from '../utils/exportUtils';

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
  const [exerciseStats, setExerciseStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [exerciseData, setExerciseData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        setError('');
        const data = getAllWorkouts();
        setWorkouts(data);
        calculateExerciseStats(data);
        calculateExerciseData(data);
      } catch (error) {
        console.error('Error fetching workouts:', error);
        setError('Failed to load workout statistics. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkouts();
  }, []);

  const calculateExerciseStats = (workouts) => {
    const statsMap = {};
    
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        const key = exercise.name.toLowerCase().trim();
        
        if (!statsMap[key]) {
          statsMap[key] = {
            name: exercise.name,
            highestWeight: { weight: exercise.weight, reps: exercise.reps, date: workout.date },
            bestReps: { weight: exercise.weight, reps: exercise.reps, date: workout.date },
            mostRecent: { weight: exercise.weight, reps: exercise.reps, date: workout.date },
            frequency: 0,
            totalSets: 0,
            dates: new Set()
          };
        }
        
        const stats = statsMap[key];
        stats.totalSets++;
        stats.dates.add(workout.date);
        
        // Track highest weight (only for weighted exercises)
        if (exercise.weight !== 'BW' && stats.highestWeight.weight !== 'BW') {
          if (exercise.weight > stats.highestWeight.weight) {
            stats.highestWeight = { weight: exercise.weight, reps: exercise.reps, date: workout.date };
          }
        }
        
        // Track best reps (for same weight or bodyweight exercises)
        if (exercise.weight === 'BW' && stats.bestReps.weight === 'BW') {
          if (exercise.reps > stats.bestReps.reps) {
            stats.bestReps = { weight: exercise.weight, reps: exercise.reps, date: workout.date };
          }
        } else if (exercise.weight !== 'BW' && stats.bestReps.weight !== 'BW') {
          if (exercise.weight === stats.bestReps.weight && exercise.reps > stats.bestReps.reps) {
            stats.bestReps = { weight: exercise.weight, reps: exercise.reps, date: workout.date };
          }
        }
        
        // Track most recent (latest date)
        if (new Date(workout.date) >= new Date(stats.mostRecent.date)) {
          stats.mostRecent = { weight: exercise.weight, reps: exercise.reps, date: workout.date };
        }
      });
    });
    
    // Calculate frequency (unique workout dates)
    Object.keys(statsMap).forEach(key => {
      statsMap[key].frequency = statsMap[key].dates.size;
    });
    
    setExerciseStats(statsMap);
  };

  const calculateExerciseData = (workouts) => {
    const exerciseMap = {};
    
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        const key = exercise.name.toLowerCase().trim();
        if (!exerciseMap[key]) {
          exerciseMap[key] = {
            name: exercise.name,
            data: []
          };
        }
        
        exerciseMap[key].data.push({
          date: workout.date,
          weight: exercise.weight,
          reps: exercise.reps
        });
      });
    });

    // Sort data by date for each exercise
    Object.keys(exerciseMap).forEach(key => {
      exerciseMap[key].data.sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    setExerciseData(exerciseMap);
  };

  const getBodyweightChartData = () => ({
    labels: workouts.map(w => new Date(w.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Bodyweight (lbs)',
        data: workouts.map(w => w.bodyweight),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }
    ]
  });

  const getExerciseChartData = (exerciseKey) => {
    const exercise = exerciseData[exerciseKey];
    if (!exercise) return null;

    const isBodyweight = exercise.data[0]?.weight === 'BW';
    
    return {
      labels: exercise.data.map(d => new Date(d.date).toLocaleDateString()),
      datasets: [
        {
          label: isBodyweight ? 'Reps' : 'Weight (lbs)',
          data: exercise.data.map(d => isBodyweight ? d.reps : d.weight),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Progress Over Time'
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  const getExerciseNames = () => {
    return Object.keys(exerciseData).map(key => ({
      key,
      name: exerciseData[key].name
    }));
  };

  const getTotalWorkouts = () => workouts.length;
  const getTotalExercises = () => Object.keys(exerciseData).length;
  const getAverageWorkoutFrequency = () => {
    if (workouts.length < 2) return 'N/A';
    const firstWorkout = new Date(workouts[workouts.length - 1].date);
    const lastWorkout = new Date(workouts[0].date);
    const daysDiff = (lastWorkout - firstWorkout) / (1000 * 60 * 60 * 24);
    const weeksActive = daysDiff / 7;
    return (workouts.length / weeksActive).toFixed(1) + ' per week';
  };

  const formatWeight = (weight) => {
    return weight === 'BW' ? 'Bodyweight' : `${weight} lbs`;
  };

  const formatReps = (reps) => {
    return `${reps} reps`;
  };

  const handleExportCSV = async () => {
    try {
      exportToCSV(workouts);
      setSnackbar({ open: true, message: 'Workout data exported to CSV successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to export data: ' + error.message, severity: 'error' });
    }
    setExportMenuAnchor(null);
  };

  const handleExportJSON = async () => {
    try {
      exportToJSON(workouts);
      setSnackbar({ open: true, message: 'Workout data exported to JSON successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to export data: ' + error.message, severity: 'error' });
    }
    setExportMenuAnchor(null);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading statistics...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Workout Statistics
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            disabled={workouts.length === 0}
          >
            <DownloadIcon />
          </IconButton>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </Box>
      </Box>

      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
      >
        <MenuItem onClick={handleExportCSV}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          Export as CSV
        </MenuItem>
        <MenuItem onClick={handleExportJSON}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          Export as JSON
        </MenuItem>
      </Menu>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {getTotalWorkouts()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Workouts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {getTotalExercises()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unique Exercises
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {getAverageWorkoutFrequency()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Frequency
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Bodyweight Progress */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bodyweight Progress
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line data={getBodyweightChartData()} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Exercise Progress */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Exercise Progress
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Exercise</InputLabel>
              <Select
                value={selectedExercise}
                label="Select Exercise"
                onChange={(e) => setSelectedExercise(e.target.value)}
              >
                {getExerciseNames().map(exercise => (
                  <MenuItem key={exercise.key} value={exercise.key}>
                    {exercise.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ height: 300 }}>
              {selectedExercise && exerciseData[selectedExercise] ? (
                <Line 
                  data={getExerciseChartData(selectedExercise)} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        display: true,
                        text: `${exerciseData[selectedExercise].name} Progress`
                      }
                    }
                  }} 
                />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    Select an exercise to view progress
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Exercise Statistics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Exercise Statistics
            </Typography>
            {Object.keys(exerciseStats).length > 0 ? (
              <List>
                {Object.entries(exerciseStats).map(([key, stats], index) => (
                  <div key={key}>
                    {index > 0 && <Divider />}
                    <ListItem sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 3 }}>
                      <Typography variant="h6" component="div" sx={{ mb: 2 }}>
                        {stats.name}
                      </Typography>
                      
                      <Grid container spacing={2}>
                        {/* Highest Weight PR */}
                        {stats.highestWeight.weight !== 'BW' && (
                          <Grid item xs={12} sm={6} md={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                              <Typography variant="body2" color="primary">
                                Highest Weight
                              </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                              {formatWeight(stats.highestWeight.weight)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatReps(stats.highestWeight.reps)} on {new Date(stats.highestWeight.date).toLocaleDateString()}
                            </Typography>
                          </Grid>
                        )}
                        
                        {/* Best Reps */}
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <FitnessCenterIcon sx={{ mr: 1, color: 'secondary.main' }} />
                            <Typography variant="body2" color="secondary">
                              Best Reps
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {formatReps(stats.bestReps.reps)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatWeight(stats.bestReps.weight)} on {new Date(stats.bestReps.date).toLocaleDateString()}
                          </Typography>
                        </Grid>
                        
                        {/* Frequency */}
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CalendarIcon sx={{ mr: 1, color: 'success.main' }} />
                            <Typography variant="body2" color="success.main">
                              Frequency
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {stats.frequency} times
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stats.totalSets} total sets
                          </Typography>
                        </Grid>
                        
                        {/* Most Recent */}
                        <Grid item xs={12} sm={6} md={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <UpdateIcon sx={{ mr: 1, color: 'warning.main' }} />
                            <Typography variant="body2" color="warning.main">
                              Most Recent
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {formatWeight(stats.mostRecent.weight)} × {formatReps(stats.mostRecent.reps)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(stats.mostRecent.date).toLocaleDateString()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </ListItem>
                  </div>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No exercise statistics yet. Start adding workouts to track your progress!
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default StatsPage; 