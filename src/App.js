import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { AccountCircle, ExitToApp } from '@mui/icons-material';

import Login from './components/AuthLogin';
import Dashboard from './components/Dashboard';
import GuestRecharge from './components/GuestRecharge';
import UserManagement from './components/UserManagement';
import MenuItemsManagement from './components/MenuItemsManagement';
import { adminLogout } from './api/adminApi';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');
    
    if (token) {
      setIsAuthenticated(true);
      // Only parse if userData exists and is valid JSON
      if (userData && userData !== 'undefined') {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('adminUser'); // Remove invalid data
        }
      }
    }
  }, []);

  const handleLogout = () => {
    adminLogout();
    setIsAuthenticated(false);
    setUser(null);
    setAnchorEl(null);
    setCurrentView('dashboard');
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'menu-items':
        return <MenuItemsManagement />;
      case 'recharge':
        return <GuestRecharge />;
      case 'users':
        return <UserManagement />;
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MessMate Admin
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              color="inherit" 
              onClick={() => setCurrentView('dashboard')}
              variant={currentView === 'dashboard' ? 'outlined' : 'text'}
            >
              Dashboard
            </Button>
            <Button 
              color="inherit" 
              onClick={() => setCurrentView('menu-items')}
              variant={currentView === 'menu-items' ? 'outlined' : 'text'}
            >
              Menu Items
            </Button>
            <Button 
              color="inherit" 
              onClick={() => setCurrentView('recharge')}
              variant={currentView === 'recharge' ? 'outlined' : 'text'}
            >
              Guest Recharge
            </Button>
            <Button 
              color="inherit" 
              onClick={() => setCurrentView('users')}
              variant={currentView === 'users' ? 'outlined' : 'text'}
            >
              User Management
            </Button>
            
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
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
              <MenuItem disabled>{user?.email || 'Admin User'}</MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ padding: 3, marginTop: '64px' }}>
        {renderContent()}
      </Box>
    </>
  );
};

export default App;