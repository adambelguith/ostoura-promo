import { useEffect, useReducer, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Tooltip,
  Switch,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Add,
  FilterList,
  Search,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  TrendingUp,
  LocalShipping,
  Inventory
} from '@mui/icons-material';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        products: action.payload.products,
        totalCount: action.payload.total,
        statistics: action.payload.statistics,
        error: '' 
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload, products: []  };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
}

export default function AdminProductsScreen() {
  const [
    { loading, error, products, loadingDelete, successDelete, totalCount, statistics },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    products: [],
    error: '',
    statistics: null
  });

  // Filtering and Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all',
    stock: 'all',
    sortBy: 'newest'
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/products`, {
          params: {
            page: page + 1,
            limit: rowsPerPage,
            ...filters,
          },
        });
        console.log('API Response:', data);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        console.error('Fetch Error:', err.message);
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
        toast.error('Failed to load products');
      }
    };
    

    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    }
    fetchData();
  }, [page, rowsPerPage, filters, successDelete]);

  const deleteHandler = async (productId) => {
    try {
      dispatch({ type: 'DELETE_REQUEST' });
      await axios.delete(`/api/admin/products/${productId}`);
      dispatch({ type: 'DELETE_SUCCESS' });
      toast.success('Product deleted successfully');
    } catch (err) {
      dispatch({ type: 'DELETE_FAIL' });
      toast.error('Failed to delete product');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleMenuOpen = (event, productId) => {
    setAnchorEl({ element: event.currentTarget, productId });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  

  return (
    <AdminLayout>
      <Box className="p-6">
         <Box className="flex justify-between items-center mb-6">
          <Typography variant="h5">Products</Typography>
          <Link href="/admin/addproduct" passHref legacyBehavior>
            <Button
              component="a"
              variant="contained"
              color="primary"
              startIcon={<Add />}
            >
              Add Product
            </Button>
          </Link>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} className="mb-6">
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Products
                </Typography>
                <Typography variant="h4">
                  {statistics?.totalProducts || 0}
                </Typography>
                <Typography color="textSecondary">
                  Active: {statistics?.activeProducts || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Low Stock
                </Typography>
                <Typography variant="h4">
                  {statistics?.lowStockProducts || 0}
                </Typography>
                <Typography color="textSecondary">
                  Out of Stock: {statistics?.outOfStockProducts || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Sales
                </Typography>
                <Typography variant="h4">
                  ${statistics?.totalSales || 0}
                </Typography>
                <Typography color="textSecondary">
                  This Month: ${statistics?.monthSales || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Approval
                </Typography>
                <Typography variant="h4">
                  {statistics?.pendingProducts || 0}
                </Typography>
                <Typography color="textSecondary">
                  Drafts: {statistics?.draftProducts || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters and Actions */}
        <Paper className="p-4 mb-6">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <Search />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <Box className="flex gap-2 justify-end">
                <TextField
                  select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  variant="outlined"
                  size="small"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  <MenuItem value="electronics">Electronics</MenuItem>
                  <MenuItem value="clothing">Clothing</MenuItem>
                </TextField>
                <TextField
                  select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  variant="outlined"
                  size="small"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </TextField>
                <TextField
                  select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  variant="outlined"
                  size="small"
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                  <MenuItem value="price_high">Price: High to Low</MenuItem>
                  <MenuItem value="price_low">Price: Low to High</MenuItem>
                  <MenuItem value="stock_low">Low Stock First</MenuItem>
                </TextField>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Products Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Sales</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
  {products?.map((product) => (
    <TableRow key={product.id}>
      {/* Product Image and Name */}
      <TableCell>
        <Box className="flex items-center gap-2">
        <img 
      src={`/api/files/${product.name_url}/${product.image}`} 
      alt={product.name_fr} 
      className="w-12 h-12 object-cover rounded" 
      // onError={(e) => e.target.src = "/placeholder.png"} 
    />
          <div>
            <Typography variant="subtitle2">{product.name_fr || "No Name"}</Typography>
          </div>
        </Box>
      </TableCell>

      {/* Category Name */}
      <TableCell>
        <Chip label={product.category?.name_fr || "Unknown"} size="small" />
      </TableCell>

      {/* Price */}
      <TableCell>
        ${product.price}
      </TableCell>

      {/* Stock */}
      <TableCell>
        <Chip
          label={`${product.quantity} in stock`}
          color={product.quantity < 10 ? "warning" : "success"}
          size="small"
        />
      </TableCell>

      {/* Status */}
      <TableCell>
        <Chip
          label={product.status}
          color={
            product.status === 'approved' ? "success" :
            product.status === 'pending' ? "warning" : "default"
          }
          size="small"
        />
      </TableCell>

      {/* Sales */}
      <TableCell>
        <Box className="flex items-center gap-1">
          <TrendingUp fontSize="small" color="primary" />
          {product.totalSales || 0}
        </Box>
      </TableCell>

      {/* Actions */}
      <TableCell align="right">
        <Box className="flex gap-2">
          <Link href={`/admin/product/${product.id}`} passHref legacyBehavior>
            <IconButton>
              <Edit fontSize="small" color="primary" />
            </IconButton>
          </Link>
          <IconButton
            onClick={() => {
              setProductToDelete(product.id);
              setDeleteModalOpen(true);
            }}
          >
            <Delete fontSize="small" color="error" />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  ))}
</TableBody>

          </Table>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>
      </Box>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        aria-labelledby="delete-confirmation-dialog"
      >
        <DialogTitle id="delete-confirmation-dialog">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={async () => {
              setDeleteModalOpen(false);
              if (productToDelete) {
                await deleteHandler(productToDelete);
              }
            }}
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
