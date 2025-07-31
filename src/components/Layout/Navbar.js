import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Home as HomeIcon,
  Add as AddIcon,
  BarChart as StatsIcon,
  AccountCircle as AccountIcon,
  Login as LoginIcon,
  PersonAdd as SignupIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleClose();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const authenticatedNavItems = [
    { label: 'Home', icon: <HomeIcon />, path: '/' },
    { label: 'Add Workout', icon: <AddIcon />, path: '/add' },
    { label: 'Stats', icon: <StatsIcon />, path: '/stats' }
  ];

  const unauthenticatedNavItems = [
    { label: 'Login', icon: <LoginIcon />, path: '/login' },
    { label: 'Sign Up', icon: <SignupIcon />, path: '/signup' }
  ];

  const navItems = currentUser ? authenticatedNavItems : unauthenticatedNavItems;

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            display: { xs: 'none', sm: 'block' }
          }}
          onClick={() => navigate('/')}
        >
          Mentzer Tracker
        </Typography>
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            display: { xs: 'block', sm: 'none' }
          }}
          onClick={() => navigate('/')}
        >
          MT
        </Typography>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              variant={location.pathname === item.path ? 'outlined' : 'text'}
              sx={{
                color: 'white',
                borderColor: location.pathname === item.path ? 'white' : 'transparent'
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>
          {navItems.map((item) => (
            <IconButton
              key={item.path}
              color="inherit"
              onClick={() => navigate(item.path)}
              sx={{
                backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent'
              }}
            >
              {item.icon}
            </IconButton>
          ))}
        </Box>

        {/* Account menu for authenticated users */}
        {currentUser && (
          <Box sx={{ ml: 2 }}>
            <IconButton
              size="large"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose} disabled>
                {currentUser.email}
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 