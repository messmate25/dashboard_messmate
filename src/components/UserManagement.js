// UserManagement.js
import React, { useState, useEffect } from 'react';
import {
  getUserById,
  deleteUserById,
  getAllUsers
} from '../api/adminApi';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Chip,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Tabs,
  Tab,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search,
  Delete,
  FilterList,
  Person,
  AdminPanelSettings,
  School,
  PersonAdd,
  Refresh,
  Visibility,
  Edit
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components for enhanced UI
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  '& .MuiTableHead-root': {
    backgroundColor: theme.palette.primary.light,
  },
  '& .MuiTableCell-head': {
    color: theme.palette.common.white,
    fontWeight: '600',
    fontSize: '14px',
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: '600',
  padding: '8px 16px',
}));

const UserManagement = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userType, setUserType] = useState('all');
  const [userId, setUserId] = useState('');
  const [singleUser, setSingleUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const  [count , setCount]  = useState(0);
  // Fetch all users on mount
  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Filter users when searchTerm, userType, or users change
  useEffect(() => {
    let filtered = [...users];

    if (userType !== 'all') {
      filtered = filtered.filter(u =>
        u.role && u.role.toLowerCase() === userType.toLowerCase()
      );
    }
    

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.id?.toString().includes(searchTerm) ||
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, userType, users, tabValue]);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      console.log("alluser" , res.data)
      setCount(res.data.guests.length);
      // Merge all types
      const allUsers = [
        ...(res.data.students || []),
        ...(res.data.guests || []),
        ...(res.data.admins || [])
      ];
      setUsers(allUsers);
      setFilteredUsers(allUsers);
      setMessage('');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await getUserById(userId);
      setSingleUser(res.data);
      setMessage('');
    } catch (err) {
      setSingleUser(null);
      setMessage(err.response?.data?.error || 'User not found');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const deleteUser = async () => {
    if (!userToDelete) return;
    setLoading(true);
    try {
      const res = await deleteUserById(userToDelete.id);
      setMessage(res.data.message || 'User deleted successfully');
      if (singleUser?.id === userToDelete.id) setSingleUser(null);
      fetchAllUsers();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Delete failed');
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return <AdminPanelSettings />;
      case 'student': return <School />;
      default: return <Person />;
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'error';
      case 'student': return 'primary';
      default: return 'default';
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Change filter based on tab selection
    if (newValue === 0) setUserType('all');
    if (newValue === 1) setUserType('student');
    if (newValue === 2) setUserType('guests');
    if (newValue === 3) setUserType('admin');
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          User Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ActionButton
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAllUsers}
            disabled={loading}
          >
            Refresh
          </ActionButton>
          <ActionButton
            variant="contained"
            startIcon={<PersonAdd />}
          >
            Add User
          </ActionButton>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', mr: 2 }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Total Users
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {users.length }
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', mr: 2 }}>
                  <School />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Students
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {users.filter(u => u.role === 'student').length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main', mr: 2 }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Guests
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {count}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', mr: 2 }}>
                  <AdminPanelSettings />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Admins
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {users.filter(u => u.role === 'admin' || u.role === 'super_admin' ).length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Tabs for user types */}
      <Paper sx={{ mb: 3, borderRadius: '12px', overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<Person />} iconPosition="start" label="All Users" />
          <Tab icon={<School />} iconPosition="start" label="Students" />
          <Tab icon={<Person />} iconPosition="start" label="Guests" />
          <Tab icon={<AdminPanelSettings />} iconPosition="start" label="Admins" />
        </Tabs>
      </Paper>

      {/* Search & Filter Section */}
      <StyledCard sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <FilterList sx={{ mr: 1 }} /> Search & Filter
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search by ID, Name, Email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Role Filter</InputLabel>
              <Select
                value={userType}
                label="Role Filter"
                onChange={(e) => setUserType(e.target.value)}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="students">Students</MenuItem>
                <MenuItem value="guests">Guests</MenuItem>
                <MenuItem value="admins">Admins</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
              <ActionButton
                variant="contained"
                onClick={fetchUser}
                disabled={loading}
                sx={{ minWidth: 'auto' }}
              >
                {loading ? <CircularProgress size={24} /> : <Search />}
              </ActionButton>
            </Box>
          </Grid>
        </Grid>
      </StyledCard>

      {/* Single User Card */}
      {singleUser && (
        <StyledCard sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <Person sx={{ mr: 1 }} /> User Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">ID</Typography>
              <Typography variant="body1" fontWeight="medium">{singleUser.id}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Name</Typography>
              <Typography variant="body1" fontWeight="medium">{singleUser.name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Email</Typography>
              <Typography variant="body1" fontWeight="medium">{singleUser.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Room</Typography>
              <Typography variant="body1" fontWeight="medium">{singleUser.room_no || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="textSecondary">Role</Typography>
              <Chip 
                icon={getRoleIcon(singleUser.role)} 
                label={singleUser.role} 
                color={getRoleColor(singleUser.role)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <ActionButton variant="outlined" startIcon={<Visibility />}>
                View Details
              </ActionButton>
              <ActionButton variant="outlined" startIcon={<Edit />}>
                Edit
              </ActionButton>
              <ActionButton
                variant="contained"
                color="error"
                startIcon={<Delete />}
                onClick={() => handleDeleteClick(singleUser)}
              >
                Delete User
              </ActionButton>
            </Grid>
          </Grid>
        </StyledCard>
      )}

      {/* Users Table */}
      <StyledCard sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Users List ({filteredUsers.length} found)
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Sorted by: Most recent
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <StyledTableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Room</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Person sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body1" color="textSecondary">
                          No users found. Try adjusting your search or filters.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      sx={{
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.03) },
                        transition: '0.3s',
                      }}
                    >
                      <TableCell>{user.id}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.main', fontSize: '14px' }}>
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </Avatar>
                          {user.name}
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.room_no || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          icon={getRoleIcon(user.role)} 
                          label={user.role} 
                          color={getRoleColor(user.role)}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" color="primary">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit User">
                            <IconButton size="small" color="secondary">
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(user)}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </StyledTableContainer>
        )}
      </StyledCard>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user <strong>{userToDelete?.name}</strong> (ID: {userToDelete?.id})? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button 
            onClick={deleteUser} 
            color="error" 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Delete />}
          >
            {loading ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Message Alert */}
      {message && (
        <Alert 
          severity={message.includes('Failed') ? 'error' : 'success'} 
          sx={{ mt: 3, borderRadius: 2, boxShadow: 2 }}
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}
    </Box>
  );
};

export default UserManagement;