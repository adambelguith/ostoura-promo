import { useEffect, useReducer, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import AdminLayout from '../../../components/AdminLayout';
import MediaUpload from '../../../components/admin/products/MediaUpload';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  Box,
  Button,
  Tab,
  Tabs,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  Save
} from '@mui/icons-material';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true, errorUpdate: '' };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false, errorUpdate: '' };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false, errorUpdate: action.payload };
    case 'UPLOAD_REQUEST':
      return { ...state, loadingUpload: true, errorUpload: '' };
    case 'UPLOAD_SUCCESS':
      return { ...state, loadingUpload: false, errorUpload: '' };
    case 'UPLOAD_FAIL':
      return { ...state, loadingUpload: false, errorUpload: action.payload };
    default:
      return state;
  }
}

export default function AdminProductEditScreen() {
  const router = useRouter();
  const { id: productId } = router.query;
  const [activeTab, setActiveTab] = useState(0);
  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    reset
  } = useForm();

  const [productData, setProductData] = useState({
    images: [],
    video: '',
    variants: [],
    specifications: [],
    category: null,
    subcategory: null,
    tags: [],
    seoData: {
      title: '',
      description: '',
      keywords: []
    }
  });

  useEffect(() => {
    if (!productId) return;

    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/products/${productId}`);
        
        // Parse JSON strings from database
        const parsedData = {
          ...data,
          images: typeof data.images === 'string' ? JSON.parse(data.images) : data.images,
          variants: typeof data.variants === 'string' ? JSON.parse(data.variants) : data.variants,
          specifications: typeof data.specifications === 'string' ? 
            JSON.parse(data.specifications) : data.specifications,
          tags: typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags,
        };

        setProductData({
          images: parsedData.images || [],
          video: parsedData.video || '',
          variants: parsedData.variants || [],
          specifications: parsedData.specifications || [],
          category: parsedData.category,
          subcategory: parsedData.subcategory,
          tags: parsedData.tags || [],
          seoData: parsedData.seoData || {
            title: parsedData.name,
            description: parsedData.description,
            keywords: []
          }
        });

        reset(parsedData); // Reset form with parsed data
        dispatch({ type: 'FETCH_SUCCESS' });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
        toast.error('Failed to load product');
      }
    };

    fetchData();
  }, [productId, reset]);

  const submitHandler = async (formData) => {
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      
      const updatedData = {
        ...formData,
        images: JSON.stringify(productData.images),
        variants: JSON.stringify(productData.variants),
        specifications: JSON.stringify(productData.specifications),
        tags: JSON.stringify(productData.tags),
        seoData: productData.seoData
      };

      const { data } = await axios.put(`/api/admin/products/${productId}`, updatedData);
      
      dispatch({ type: 'UPDATE_SUCCESS' });
      toast.success('Product updated successfully');
      router.push('/admin/products');
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL', payload: err.message });
      toast.error('Failed to update product');
    }
  };

  if (!productId) {
    return <AdminLayout>Loading...</AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <Button 
            startIcon={<ArrowBack />}
            onClick={() => router.push('/admin/products')}
            variant="outlined"
          >
            Back to Products
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <CircularProgress />
          </div>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <form onSubmit={handleSubmit(submitHandler)}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                aria-label="product edit tabs"
              >
                <Tab label="Basic Info" id="tab-0" />
                <Tab label="Media" id="tab-1" />
                <Tab label="Variants" id="tab-2" />
                <Tab label="Specifications" id="tab-3" />
                <Tab label="SEO" id="tab-4" />
              </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
              <BasicInfoForm 
                register={register} 
                errors={errors}
                control={control}
                productData={productData}
                setProductData={setProductData}
              />
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <MediaUpload 
                productData={productData}
                setProductData={setProductData}
              />
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <VariantsForm 
                productData={productData}
                setProductData={setProductData}
                control={control}
              />
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              <SpecificationsForm 
                productData={productData}
                setProductData={setProductData}
                control={control}
              />
            </TabPanel>

            <TabPanel value={activeTab} index={4}>
              <SeoForm 
                productData={productData}
                setProductData={setProductData}
                control={control}
              />
            </TabPanel>

            <div className="flex justify-end mt-6">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<Save />}
                disabled={loadingUpdate}
              >
                {loadingUpdate ? 'Updating...' : 'Update Product'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}

function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}







