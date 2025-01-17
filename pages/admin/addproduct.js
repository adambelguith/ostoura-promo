import { useEffect, useReducer, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm, Controller } from 'react-hook-form';
import AdminLayout from '../../components/AdminLayout';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Box,
  Grid,
  Paper,
  Button,
  TextField,
  MenuItem,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import {
  Save,
  AddPhotoAlternate,
  Delete,
  ArrowBack,
  ArrowForward,
  Preview
} from '@mui/icons-material';
import QuillEditor from '../../components/QuillEditor';



const steps = [
  'Basic Information',
  'Media & Gallery',
  'Pricing & Inventory',
  'Variants & Options',
  'SEO & Visibility'
];

const initialState = {
  loadingUpload: false,
  loadingCreate: false,
  errorUpload: '',
  errorCreate: '',
  categories: [],
  uploadProgress: 0
};

function reducer(state, action) {
  switch (action.type) {
    case 'UPLOAD_REQUEST':
      return { ...state, loadingUpload: true, errorUpload: '', uploadProgress: 0 };
    case 'UPLOAD_PROGRESS':
      return { ...state, uploadProgress: action.payload };
    case 'UPLOAD_SUCCESS':
      return { ...state, loadingUpload: false, errorUpload: '', uploadProgress: 100 };
    case 'UPLOAD_FAIL':
      return { ...state, loadingUpload: false, errorUpload: action.payload, uploadProgress: 0 };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true, errorCreate: '' };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreate: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false, errorCreate: action.payload };
    case 'FETCH_CATEGORIES_SUCCESS':
      return { ...state, categories: action.payload };
    case 'FETCH_CATEGORIES_FAIL':
      return { ...state, categories: [], errorCreate: action.payload };
    default:
      return state;
  }
}

export default function AddProduct() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { loadingUpload, loadingCreate, categories, uploadProgress, errorUpload, errorCreate } = state;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isValid }
  } = useForm({
    defaultValues: {
      name: '',
      slug: '',
      category: '',
      subcategory: '',
      description: '',
      price: '',
      salePrice: '',
      costPrice: '',
      sku: '',
      barcode: '',
      stock: '',
      images: [],
      video: '',
      brand: '',
      tags: [],
      status: 'draft',
      featured: false,
      taxable: true,
      shippingRequired: true,
      seoTitle: '',
      seoDescription: '',
      seoKeywords: [],
      variants: [],
      specifications: []
    },
    mode: 'onChange'
  });

  const watchName = watch('name');
  const [previewMode, setPreviewMode] = useState(false);
  const [variantOptions, setVariantOptions] = useState([
    { name: 'Size', values: [] },
    { name: 'Color', values: [] }
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('/api/admin/categories');
        dispatch({ type: 'FETCH_CATEGORIES_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ 
          type: 'FETCH_CATEGORIES_FAIL', 
          payload: err.response?.data?.message || 'Failed to load categories' 
        });
        toast.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (watchName) {
      const slug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', slug);
    }
  }, [watchName, setValue]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB

    // Validate file size and type
    const invalidFiles = files.filter(
      file => file.size > maxSize || !file.type.startsWith('image/')
    );

    if (invalidFiles.length > 0) {
      toast.error('Some files are too large or not images');
      return;
    }

    try {
      dispatch({ type: 'UPLOAD_REQUEST' });
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const { data } = await axios.post('/api/admin/upload', formData, {
          onUploadProgress: (progressEvent) => {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            dispatch({ type: 'UPLOAD_PROGRESS', payload: progress });
          }
        });
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const currentImages = watch('images') || [];
      setValue('images', [...currentImages, ...uploadedUrls]);
      dispatch({ type: 'UPLOAD_SUCCESS' });
      toast.success('Images uploaded successfully');
    } catch (err) {
      dispatch({ 
        type: 'UPLOAD_FAIL', 
        payload: err.response?.data?.message || 'Failed to upload images' 
      });
      toast.error('Failed to upload images');
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const onSubmit = async (data) => {
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      
      // Transform data before sending
      const productData = {
        ...data,
        price: parseFloat(data.price),
        salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
        costPrice: data.costPrice ? parseFloat(data.costPrice) : null,
        stock: parseInt(data.stock, 10),
        variants: generateVariants(data.variants, variantOptions),
        status: data.status || 'draft'
      };

      await axios.post('/api/admin/products', productData);
      dispatch({ type: 'CREATE_SUCCESS' });
      toast.success('Product created successfully');
      router.push('/admin/products');
    } catch (err) {
      dispatch({ 
        type: 'CREATE_FAIL', 
        payload: err.response?.data?.message || 'Failed to create product' 
      });
      toast.error(err.response?.data?.message || 'Failed to create product');
    }
  };

  const generateVariants = (baseVariants, options) => {
    if (!options.some(opt => opt.values.length > 0)) return [];

    const variants = options.reduce((acc, option) => {
      if (option.values.length === 0) return acc;
      
      if (acc.length === 0) {
        return option.values.map(value => ({
          [option.name]: value,
          price: 0,
          stock: 0,
          sku: ''
        }));
      }

      return acc.flatMap(existing => 
        option.values.map(value => ({
          ...existing,
          [option.name]: value
        }))
      );
    }, []);

    return variants;
  };

  return (
    <AdminLayout>
      <Box className="p-6">
        <Paper className="p-6">
          <Box className="flex justify-between items-center mb-6">
            <Typography variant="h5">Add New Product</Typography>
            <Box className="flex gap-2">
              <Button
                variant="outlined"
                startIcon={<Preview />}
                onClick={() => setPreviewMode(!previewMode)}
              >
                Preview
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit(onSubmit)}
                disabled={loadingCreate || !isDirty}
              >
                {loadingCreate ? 'Creating...' : 'Create Product'}
              </Button>
            </Box>
          </Box>

          <Stepper activeStep={activeStep} className="mb-6">
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form>
            {/* Basic Information */}
            {activeStep === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" className="mb-4">
                        Basic Information
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Controller
                            name="name"
                            control={control}
                            rules={{ required: 'Name is required' }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Product Name"
                                error={!!errors.name}
                                helperText={errors.name?.message}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle1" className="mb-2">
                            Product Description
                          </Typography>
                          <Controller
                            name="description"
                            control={control}
                            rules={{ 
                              required: 'Description is required',
                              validate: value => 
                                value.replace(/<[^>]*>/g, '').trim().length > 0 || 
                                'Description cannot be empty'
                            }}
                            render={({ field }) => (
                              <QuillEditor
                                value={field.value}
                                onChange={field.onChange}
                                error={errors.description?.message}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" className="mb-4">
                        Organization
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Controller
                            name="category"
                            control={control}
                            rules={{ required: 'Category is required' }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                select
                                fullWidth
                                label="Category"
                                error={!!errors.category}
                                helperText={errors.category?.message}
                              >
                                {categories.map((category) => (
                                  <MenuItem key={category.id} value={category.id}>
                                    {category.name}
                                  </MenuItem>
                                ))}
                              </TextField>
                            )}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Controller
                            name="tags"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                label="Tags"
                                placeholder="Enter tags separated by commas"
                                onChange={(e) => {
                                  const tags = e.target.value.split(',').map(tag => tag.trim());
                                  field.onChange(tags);
                                }}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Navigation Buttons */}
            <Box className="flex justify-between mt-6">
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBack />}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={activeStep === steps.length - 1 ? handleSubmit(onSubmit) : handleNext}
                endIcon={activeStep === steps.length - 1 ? <Save /> : <ArrowForward />}
              >
                {activeStep === steps.length - 1 ? 'Create Product' : 'Next'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </AdminLayout>
  );
}

// Add authentication and permissions check
AddProduct.auth = {
  required: true,
  permissions: ['create_products']
};







