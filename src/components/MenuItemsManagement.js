import React, { useState, useEffect } from 'react';
import {
  addMenuItem,
  getAllMenuItems,
  updateMenuItem,
  deleteMenuItem
} from '../api/adminApi';
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
  IconButton
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const MenuItemsManagement = () => {
  const [formData, setFormData] = useState({
    name: '',
    estimated_prep_time: '',
    monthly_limit: '',
    extra_price: ''
  });
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = () => {
    setLoading(true);
    getAllMenuItems()
      .then(res => {
        setMenuItems(res.data.menu_items);
        setLoading(false);
        console.log("hellp",res.data);
      })
      .catch(err => {
        setMessage(err.response?.data?.error || 'Failed to fetch menu items');
        setLoading(false);
      });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    const submitData = {
      ...formData,
      estimated_prep_time: parseInt(formData.estimated_prep_time),
      monthly_limit: parseInt(formData.monthly_limit),
      extra_price: parseFloat(formData.extra_price)
    };
    
    if (editingItem) {
      updateMenuItem(editingItem.id, submitData)
        .then(res => {
          setMessage('Menu item updated successfully!');
          setEditingItem(null);
          setFormData({
            name: '',
            estimated_prep_time: '',
            monthly_limit: '',
            extra_price: ''
          });
          fetchMenuItems();
          setLoading(false);
        })
        .catch(err => {
          setMessage(err.response?.data?.error || 'Failed to update menu item');
          setLoading(false);
        });
    } else {
      addMenuItem(submitData)
        .then(res => {
          setMessage(`Menu item added successfully! ID: ${res.data.item.id}`);
          setFormData({
            name: '',
            estimated_prep_time: '',
            monthly_limit: '',
            extra_price: ''
          });
          fetchMenuItems();
          setLoading(false);
        })
        .catch(err => {
          setMessage(err.response?.data?.error || 'Failed to add menu item');
          setLoading(false);
        });
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      estimated_prep_time: item.estimated_prep_time.toString(),
      monthly_limit: item.monthly_limit.toString(),
      extra_price: item.extra_price.toString()
    });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      estimated_prep_time: '',
      monthly_limit: '',
      extra_price: ''
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      setLoading(true);
      deleteMenuItem(id)
        .then(res => {
          setMessage('Menu item deleted successfully!');
          fetchMenuItems();
          setLoading(false);
        })
        .catch(err => {
          setMessage(err.response?.data?.error || 'Failed to delete menu item');
          setLoading(false);
        });
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Menu Items Management
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Item Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Estimated Prep Time (minutes)"
                      name="estimated_prep_time"
                      type="number"
                      value={formData.estimated_prep_time}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Monthly Limit"
                      name="monthly_limit"
                      type="number"
                      value={formData.monthly_limit}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Extra Price (₹)"
                      name="extra_price"
                      type="number"
                      value={formData.extra_price}
                      onChange={handleChange}
                      inputProps={{ step: "0.01" }}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      disabled={loading}
                      fullWidth
                      size="large"
                    >
                      {loading ? <CircularProgress size={24} /> : 
                        (editingItem ? 'Update Menu Item' : 'Add Menu Item')}
                    </Button>
                    {editingItem && (
                      <Button 
                        variant="outlined" 
                        onClick={handleCancelEdit}
                        fullWidth
                        size="large"
                        sx={{ mt: 1 }}
                      >
                        Cancel
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Existing Menu Items
              </Typography>
              
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Prep Time</TableCell>
                        <TableCell>Monthly Limit</TableCell>
                        <TableCell>Extra Price</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {menuItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.estimated_prep_time} mins</TableCell>
                          <TableCell>{item.monthly_limit}</TableCell>
                          <TableCell>₹{item.extra_price}</TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={() => handleEdit(item)}>
                              <Edit />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDelete(item.id)}>
                              <Delete />
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
        <Alert severity={message.includes('successfully') ? 'success' : 'error'} sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}
    </Box>
  );
};

export default MenuItemsManagement;