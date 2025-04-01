import { useEffect, useReducer, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSession } from 'next-auth/react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import { ArrowBack, ArrowForward, Save } from '@mui/icons-material';
import MediaUpload from '../../../components/admin/products/MediaUpload';
import QuillEditor from '../../../components/QuillEditor';
import VariantsStep from '../../../components/VariantsStep';

const steps = ['Basic Information', 'Media & Gallery', 'Pricing & Inventory', 'Variants'];

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, product: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false, successUpdate: true };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };
    default:
      return state;
  }
}

export default function EditProduct() {
  const router = useRouter();
  const { id } = router.query;
  const [activeStep, setActiveStep] = useState(0);
  const [state, dispatch] = useReducer(reducer, {
    loading: true,
    product: null,
    error: '',
    loadingUpdate: false,
    successUpdate: false,
  });
  const { product, loading, error, loadingUpdate } = state;

  const { data: session } = useSession();
  const sellerId = session?.user?.id;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isValid },
  } = useForm({
    defaultValues: {
      name_fr: '',
      name_ar: '',
      name_url: '',
      description: '',
      images: [],
      categoryId: '',
      price: '',
      quantity: 0,
      quantity_endommage: 0,
      quantity_notification: 0,
      status: 'pending',
      sellerId: sellerId,
    },
    mode: 'onChange',
  });

  const [selectedVariants, setSelectedVariants] = useState({ colors: [], sizes: [] });
  const [uploadedImages, setUploadedImages] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/products/${id}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });

        // Set form values
        setValue('name_fr', data.name_fr);
        setValue('name_ar', data.name_ar);
        setValue('name_url', data.name_url);
        setValue('description', data.description);
        setValue('images', data.images);
        setValue('categoryId', data.categoryId);
        setValue('price', data.price);
        setValue('quantity', data.quantity);
        setValue('quantity_endommage', data.quantity_endommage);
        setValue('quantity_notification', data.quantity_notification);
        setValue('status', data.status);
        setValue('sellerId', data.sellerId);

        // Set variants
        if (data.variants) {
          setSelectedVariants(data.variants);
        }
        console.log(data.description)

        // Set uploaded images
        setUploadedImages(data.images || []);
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
        toast.error('Failed to load product');
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, setValue]);


  const onSubmit = async (data) => {
    try {
      dispatch({ type: 'UPDATE_REQUEST' });

      // Transform data before sending
      const productData = {
        ...data,
        images: uploadedImages,
        price: parseFloat(data.price),
        quantity: parseInt(data.quantity, 10),
        quantity_endommage: parseInt(data.quantity_endommage, 10),
        quantity_notification: parseInt(data.quantity_notification, 10),
        sellerId: sellerId,
        variants: selectedVariants,
      };

      await axios.put(`/api/admin/products/${id}`, productData);
      dispatch({ type: 'UPDATE_SUCCESS' });
      toast.success('Product updated successfully');
      router.push('/admin/products');
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL', payload: err.message });
      toast.error('Failed to update product');
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleImagesChange = (imageNames) => {
    setUploadedImages(imageNames);
    setValue('images', imageNames);
  };

  return (
    <AdminLayout>
      <Box className="p-6">
        <Paper className="p-6">
          <Typography variant="h4" className="mb-6">
            Edit Product
          </Typography>
          <Stepper activeStep={activeStep} alternativeLabel className="mb-6">
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Basic Information */}
            {activeStep === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, #6a11cb, #2575fc)',
                      color: '#fff',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
                      },
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" className="mb-4">
                        Basic Information
                      </Typography>
                      <Grid container spacing={3}>
                        {/* Product Name (French) */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Product Name (French)"
                            name="name_fr"
                            value={watch('name_fr')}
                            onChange={(e) => setValue('name_fr', e.target.value)}
                            required
                            InputLabelProps={{ style: { color: '#fff' } }}
                            InputProps={{
                              style: { color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
                            }}
                          />
                        </Grid>

                        {/* Product Name (Arabic) */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Product Name (Arabic)"
                            name="name_ar"
                            value={watch('name_ar')}
                            onChange={(e) => setValue('name_ar', e.target.value)}
                            required
                            InputLabelProps={{ style: { color: '#fff' } }}
                            InputProps={{
                              style: { color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
                            }}
                          />
                        </Grid>

                        {/* Product URL */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Product URL"
                            name="name_url"
                            value={watch('name_url')}
                            onChange={(e) => setValue('name_url', e.target.value)}
                            required
                            InputLabelProps={{ style: { color: '#fff' } }}
                            InputProps={{
                              style: { color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
                            }}
                          />
                        </Grid>

                        {/* Product Description */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle1" className="mb-2">
                            Product Description
                          </Typography>
                          <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                              <QuillEditor
                                productId={watch('name_url')}
                                value={field.value}
                                onChange={(value) => setValue('description', value)}
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

            {/* Media & Gallery */}
            {activeStep === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, #6a11cb, #2575fc)',
                      color: '#fff',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
                      },
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" className="mb-4">
                        Media & Gallery
                      </Typography>
                      <MediaUpload
                        uploadedImages={uploadedImages}
                        onImagesChange={handleImagesChange}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Pricing & Inventory */}
            {activeStep === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, #6a11cb, #2575fc)',
                      color: '#fff',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
                      },
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" className="mb-4">
                        Pricing & Inventory
                      </Typography>
                      <Grid container spacing={3}>
                        {/* Price */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Price"
                            name="price"
                            value={watch('price')}
                            onChange={(e) => setValue('price', e.target.value)}
                            required
                            InputLabelProps={{ style: { color: '#fff' } }}
                            InputProps={{
                              style: { color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
                            }}
                          />
                        </Grid>

                        {/* Quantity */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Quantity"
                            name="quantity"
                            value={watch('quantity')}
                            onChange={(e) => setValue('quantity', e.target.value)}
                            required
                            InputLabelProps={{ style: { color: '#fff' } }}
                            InputProps={{
                              style: { color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
                            }}
                          />
                        </Grid>

                        {/* Damaged Quantity */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Damaged Quantity"
                            name="quantity_endommage"
                            value={watch('quantity_endommage')}
                            onChange={(e) => setValue('quantity_endommage', e.target.value)}
                            InputLabelProps={{ style: { color: '#fff' } }}
                            InputProps={{
                              style: { color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
                            }}
                          />
                        </Grid>

                        {/* Notification Quantity */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Notification Quantity"
                            name="quantity_notification"
                            value={watch('quantity_notification')}
                            onChange={(e) => setValue('quantity_notification', e.target.value)}
                            InputLabelProps={{ style: { color: '#fff' } }}
                            InputProps={{
                              style: { color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
                            }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Variants */}
            {activeStep === 3 && (
              <VariantsStep
                selectedVariants={selectedVariants}
                setSelectedVariants={setSelectedVariants}
              />
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
                onClick={
                  activeStep === steps.length - 1
                    ? handleSubmit(onSubmit)
                    : handleNext
                }
                endIcon={
                  activeStep === steps.length - 1 ? <Save /> : <ArrowForward />
                }
                className="bg-blue-400"
              >
                {activeStep === steps.length - 1 ? "Update Product" : "Next"}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </AdminLayout>
  );
}