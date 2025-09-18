// GuestRecharge.js
import React, { useState, useEffect } from 'react';
import { rechargeGuest, getAllUsers } from '../api/adminApi';
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  Search,
  AccountBalanceWallet,
  Add as AddIcon
} from '@mui/icons-material';

const GuestRecharge = () => {
  const [rechargeData, setRechargeData] = useState({
    guestId: '',
    amount: ''
  });
  const [guests, setGuests] = useState([]);
  const [filteredGuests, setFilteredGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);

  useEffect(() => {
    fetchGuests();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = guests.filter(guest => 
        guest.id.toString().includes(searchTerm) || 
        guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGuests(filtered);
    } else {
      setFilteredGuests(guests);
    }
  }, [searchTerm, guests]);

  const fetchGuests = () => {
    setLoading(true);
    getAllUsers()
      .then(res => {
        console.log("alluser" , res.data)
        // Filter only guest users (assuming role is available)
        const guestUsers = res.data.guests || [];
        setGuests(guestUsers);
        setFilteredGuests(guestUsers);
        setLoading(false);
      })
      .catch(err => {
        setMessage(err.response?.data?.error || 'Failed to fetch guests');
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    setRechargeData({
      ...rechargeData,
      [e.target.name]: e.target.value
    });
  };

  const handleRecharge = () => {
    if (!rechargeData.guestId || !rechargeData.amount) {
      setMessage('Please provide both Guest ID and Amount');
      return;
    }

    setLoading(true);
    rechargeGuest({ 
      guestId: parseInt(rechargeData.guestId), 
      amount: parseFloat(rechargeData.amount) 
    })
      .then(res => {
        setMessage(`Recharge successful! New Balance: ₹${res.data.new_balance}`);
        setRechargeData({
          guestId: '',
          amount: ''
        });
        setLoading(false);
        fetchGuests(); // Refresh guest list to potentially update balances
      })
      .catch(err => {
        setMessage(err.response?.data?.error || 'Recharge failed');
        setLoading(false);
      });
  };

  const handleQuickRecharge = (guest) => {
    setSelectedGuest(guest);
    setRechargeData({
      guestId: guest.id,
      amount: ''
    });
    setOpenDialog(true);
  };

  const handleDialogRecharge = () => {
    if (!rechargeData.amount) {
      setMessage('Please enter an amount');
      return;
    }

    setLoading(true);
    rechargeGuest({ 
      guestId: parseInt(rechargeData.guestId), 
      amount: parseFloat(rechargeData.amount) 
    })
      .then(res => {
        setMessage(`Recharge successful for ${selectedGuest.name}! New Balance: ₹${res.data.new_balance}`);
        setRechargeData({
          guestId: '',
          amount: ''
        });
        setOpenDialog(false);
        setSelectedGuest(null);
        setLoading(false);
        fetchGuests();
      })
      .catch(err => {
        setMessage(err.response?.data?.error || 'Recharge failed');
        setLoading(false);
      });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Guest Wallet Recharge
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Recharge Wallet
              </Typography>
              
              <Box component="form" sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Guest ID"
                  name="guestId"
                  value={rechargeData.guestId}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                  required
                />
                
                <TextField
                  fullWidth
                  label="Amount (₹)"
                  name="amount"
                  type="number"
                  value={rechargeData.amount}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  sx={{ mb: 2 }}
                  required
                />
                
                <Button 
                  variant="contained" 
                  onClick={handleRecharge} 
                  disabled={loading}
                  fullWidth
                  size="large"
                  startIcon={<AccountBalanceWallet />}
                >
                  {loading ? <CircularProgress size={24} /> : 'Recharge Wallet'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Guest List
              </Typography>
              
              <TextField
                label="Search Guests"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Room No</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredGuests.map((guest) => (
                        <TableRow key={guest.id} hover>
                          <TableCell>{guest.id}</TableCell>
                          <TableCell>{guest.name}</TableCell>
                          <TableCell>{guest.email}</TableCell>
                          <TableCell>{guest.room_no}</TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              color="primary" 
                              onClick={() => handleQuickRecharge(guest)}
                            >
                              <AddIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {message && (
        <Alert 
          severity={message.includes('successful') ? 'success' : 'error'} 
          sx={{ mt: 2 }}
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}

      {/* Quick Recharge Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          Recharge {selectedGuest?.name}'s Wallet
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount (₹)"
            type="number"
            fullWidth
            variant="outlined"
            value={rechargeData.amount}
            onChange={(e) => setRechargeData({...rechargeData, amount: e.target.value})}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDialogRecharge} 
            disabled={loading}
            variant="contained"
          >
            {loading ? <CircularProgress size={24} /> : 'Recharge'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GuestRecharge;