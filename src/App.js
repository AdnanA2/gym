import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { WorkoutDataProvider } from './contexts/WorkoutDataContext';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import AddWorkout from './pages/AddWorkout';
import WorkoutDetail from './pages/WorkoutDetail';
import StatsPage from './pages/StatsPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <WorkoutDataProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/add" element={<AddWorkout />} />
              <Route path="/add/:id" element={<AddWorkout />} />
              <Route path="/workout/:id" element={<WorkoutDetail />} />
              <Route path="/stats" element={<StatsPage />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </WorkoutDataProvider>
    </AuthProvider>
  );
}

export default App; 