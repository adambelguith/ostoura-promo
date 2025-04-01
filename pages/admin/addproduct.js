import { useEffect, useReducer, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useForm, Controller } from "react-hook-form";
import AdminLayout from "../../components/AdminLayout";
import axios from "axios";
import { toast } from "react-toastify";
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
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
} from "@mui/material";
import {
  Save,
  ArrowBack,
  ArrowForward,
  LocalOffer,
  LocalShipping,
  AttachMoney,
  Check,
  Circle,
} from "@mui/icons-material";
import QuillEditor from "../../components/QuillEditor";
import { useSession } from 'next-auth/react';
import MediaUpload from '../../components/admin/products/MediaUpload';
import VariantsStep from '../../components/VariantsStep';

const steps = [
  "Basic Information",
  "Media & Gallery",
  "Pricing & Inventory",
  "Promotions",
  "Varients"
];

const initialState = {
  loadingUpload: false,
  loadingCreate: false,
  errorUpload: "",
  errorCreate: "",
  categories: [],
  uploadProgress: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case "UPLOAD_REQUEST":
      return {
        ...state,
        loadingUpload: true,
        errorUpload: "",
        uploadProgress: 0,
      };
    case "UPLOAD_PROGRESS":
      return { ...state, uploadProgress: action.payload };
    case "UPLOAD_SUCCESS":
      return {
        ...state,
        loadingUpload: false,
        errorUpload: "",
        uploadProgress: 100,
      };
    case "UPLOAD_FAIL":
      return {
        ...state,
        loadingUpload: false,
        errorUpload: action.payload,
        uploadProgress: 0,
      };
    case "CREATE_REQUEST":
      return { ...state, loadingCreate: true, errorCreate: "" };
    case "CREATE_SUCCESS":
      return { ...state, loadingCreate: false };
    case "CREATE_FAIL":
      return { ...state, loadingCreate: false, errorCreate: action.payload };
    case "FETCH_CATEGORIES_SUCCESS":
      return { ...state, categories: action.payload };
    case "FETCH_CATEGORIES_FAIL":
      return { ...state, categories: [], errorCreate: action.payload };
    default:
      return state;
  }
}


export default function AddProduct() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    categories,
  } = state;

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
      name_fr: "",
      name_ar: "",
      name_url: "",
      description: "",
      images: [],
      categoryId: "",
      price: "",
      quantity: 0,
      quantity_endommage: 0,
      quantity_notification: 0,
      status: "pending",
      sellerId: sellerId,
    },
    mode: "onChange",
  });

  const watchName = watch("name_fr");

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState({ colors: [], sizes: [] });

  


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get("/api/admin/categories");
        dispatch({ type: "FETCH_CATEGORIES_SUCCESS", payload: data });
      } catch (err) {
        dispatch({
          type: "FETCH_CATEGORIES_FAIL",
          payload: err.response?.data?.message || "Failed to load categories",
        });
        toast.error("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Function to check if a slug exists in the database
  const isSlugUnique = async (slug) => {
    try {
      const { data } = await axios.get(`/api/admin/products/check-slug?slug=${slug}`);
      return !data.exists; // Return true if the slug is unique
    } catch (error) {
      console.error('Error checking slug:', error);
      return false; // Assume the slug is not unique if there's an error
    }
  };

  // Function to generate a unique slug
  const generateUniqueSlug = async (baseSlug) => {
    let slug = baseSlug;
    let isUnique = await isSlugUnique(slug);
    let counter = 1;

    // Append a number to the slug until it's unique
    while (!isUnique) {
      slug = `${baseSlug}-${counter}`;
      isUnique = await isSlugUnique(slug);
      counter++;
    }

    return slug;
  };

  // Update the slug when the product name changes
  useEffect(() => {
    const updateSlug = async () => {
      if (watchName) {
        const baseSlug = watchName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        const uniqueSlug = await generateUniqueSlug(baseSlug);
        setValue("name_url", uniqueSlug);
      }
    };

    // Add a 1-second delay before generating the slug
    const delayDebounceFn = setTimeout(() => {
      updateSlug();
    }, 1000);

    // Clear the timeout if the effect is re-run
    return () => clearTimeout(delayDebounceFn);
  }, [watchName, setValue]);

 
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Handle image names from MediaUpload
const handleImagesChange = useCallback((imageNames) => {
  setUploadedImages(imageNames);
}, []);


  const onSubmit = async (data) => {
    try {
      dispatch({ type: "CREATE_REQUEST" });

      // Transform retail discount into JSON
      const remise_prodique = {
        start_date: data.remise_prodique_start,
        end_date: data.remise_prodique_end,
        percentage: parseFloat(data.remise_prodique_percentage),
      };

      // Transform wholesale discount into JSON
      const remise_gros = {
        start_date: data.remise_gros_start,
        end_date: data.remise_gros_end,
        percentage: parseFloat(data.remise_gros_percentage),
        min_quantity: parseInt(data.remise_gros_min_quantity, 10),
      };

      // Transform data before sending
      const productData = {
        ...data,
        images: uploadedImages, // Include image names in the product data
        price: parseFloat(data.price),
        quantity: parseInt(data.quantity, 10),
        quantity_endommage: parseInt(data.quantity_endommage, 10),
        quantity_notification: parseInt(data.quantity_notification, 10),
        sellerId: sellerId,
        variants: selectedVariants, // Include variants
        remise_prodique, // Include retail discount
        remise_gros, // Include wholesale discount
      };

      const response = await axios.post("/api/admin/products", productData);
      if (response.status === 201) {

        dispatch({ type: "CREATE_SUCCESS" });
        toast.success("Product created successfully");
        router.push("/admin/products");
      } else {
        throw new Error("Failed to create product");
      }
    } catch (err) {
      if (err.response?.status === 413) {
        toast.error('The product description is too large. Please reduce the size of images or text.');
      } else {
        console.error('Error submitting product:', err);
        toast.error('Failed to create product');
      }
      dispatch({
        type: "CREATE_FAIL",
        payload: err.response?.data?.message || "Failed to create product",
      });
    }
  };

  // Group categories by parent
  const groupedCategories = categories.reduce((acc, cat) => {
    if (cat.id_fathercategory) {
      const parent = categories.find((c) => c.id === cat.id_fathercategory);
      if (parent) {
        if (!acc[parent.name_fr]) {
          acc[parent.name_fr] = [];
        }
        acc[parent.name_fr].push(cat);
      }
    }
    return acc;
  }, {});

  return (
    <AdminLayout>
  <Box className="p-4">
    <Paper className="p-4">
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h5">Add New Product</Typography>
      </Box>

      {/* Stepper */}
      <Stepper
        activeStep={activeStep}
        className="mb-6"
        sx={{
          flexDirection: { xs: 'column', sm: 'row' }, // Vertical on mobile, horizontal on larger screens
          alignItems: { xs: 'flex-start', sm: 'center' }, // Align left on mobile, center on larger screens
          gap: { xs: 2, sm: 0 }, // Add gap between steps on mobile
        }}
      >
        {steps.map((label, index) => (
          <Step key={label} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <StepLabel
              sx={{
                flexDirection: { xs: 'row', sm: 'column' }, // Horizontal on mobile, vertical on larger screens
                alignItems: { xs: 'center', sm: 'flex-start' }, // Center on mobile, align left on larger screens
                gap: { xs: 1, sm: 0 }, // Add gap between icon and label on mobile
                minHeight: { xs: 'auto', sm: '64px' }, // Adjust height for mobile
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                {/* Step Icon */}
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: activeStep >= index ? '#6a11cb' : '#e0e0e0',
                    color: activeStep >= index ? '#fff' : '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                  }}
                >
                  {activeStep >= index ? <Check fontSize="small" /> : <Circle fontSize="small" />}
                </Box>
                {/* Step Label */}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: activeStep >= index ? 'bold' : 'normal',
                    whiteSpace: { xs: 'normal', sm: 'nowrap' }, // Wrap text on mobile, no wrap on larger screens
                  }}
                >
                  {label}
                </Typography>
              </Box>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <form>
        {/* Basic Information */}
        {activeStep === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
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
                        value={watch("name_fr")}
                        onChange={(e) => setValue("name_fr", e.target.value)}
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
                        value={watch("name_ar")}
                        onChange={(e) => setValue("name_ar", e.target.value)}
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
                        value={watch("name_url")}
                        onChange={(e) => setValue("name_url", e.target.value)}
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
                        rules={{ required: "Description is required" }}
                        render={({ field }) => (
                          <QuillEditor
                            productId={watch('name_url')}
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

            {/* Organization */}
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #ff7e5f, #feb47b)',
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
                    Organization
                  </Typography>
                  <Grid container spacing={3}>
                    {/* Category */}
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel style={{ color: '#fff' }}>Category</InputLabel>
                        <Select
                          value={watch("categoryId")}
                          onChange={(e) => setValue("categoryId", e.target.value)}
                          label="Category"
                          style={{ color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                        >
                          {loadingCategories ? (
                            <MenuItem disabled>Loading categories...</MenuItem>
                          ) : (
                            Object.entries(groupedCategories).flatMap(([parent, subcategories]) => [
                              <MenuItem
                                key={parent}
                                value=""
                                disabled
                                style={{
                                  fontWeight: "bold",
                                  backgroundColor: "#f5f5f5",
                                  cursor: "default",
                                }}
                              >
                                {parent}
                              </MenuItem>,
                              ...subcategories.map((cat) => (
                                <MenuItem
                                  key={cat.id}
                                  value={cat.id}
                                  style={{
                                    paddingLeft: "24px", // Indent subcategories
                                  }}
                                >
                                  {cat.name_fr}
                                </MenuItem>
                              )),
                            ])
                          )}
                        </Select>
                      </FormControl>
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
                  background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
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
                    productId={watch('name_url')}
                    productData={watch()}
                    setProductData={(data) => setValue('media', data.media)}
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
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
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
                      <Box display="flex" alignItems="center" mb={3}>
                        <AttachMoney sx={{ fontSize: 30, mr: 2 }} />
                        <Typography variant="h5" fontWeight="bold">
                          Pricing & Inventory
                        </Typography>
                      </Box>
                      <Grid container spacing={3}>
                        {/* Price */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Price"
                            name="price"
                            value={watch("price")}
                            onChange={(e) => setValue("price", e.target.value)}
                            required
                            InputLabelProps={{ style: { color: '#fff' } }}
                            InputProps={{
                              style: { color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
                            }}
                          />
                        </Grid>

                        {/* Quantity */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Quantity"
                            name="quantity"
                            value={watch("quantity")}
                            onChange={(e) => setValue("quantity", e.target.value)}
                            type="number"
                            required
                            InputLabelProps={{ style: { color: '#fff' } }}
                            InputProps={{
                              style: { color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
                            }}
                          />
                        </Grid>

                        {/* Damaged Quantity */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Damaged Quantity"
                            name="quantity_endommage"
                            value={watch("quantity_endommage")}
                            onChange={(e) => setValue("quantity_endommage", e.target.value)}
                            type="number"
                            InputLabelProps={{ style: { color: '#fff' } }}
                            InputProps={{
                              style: { color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
                            }}
                          />
                        </Grid>

                        {/* Notification Quantity */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Notification Quantity"
                            name="quantity_notification"
                            value={watch("quantity_notification")}
                            onChange={(e) => setValue("quantity_notification", e.target.value)}
                            type="number"
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

            {activeStep === 3 && ( // Promotions step
              <Grid container spacing={3}>
                {/* Retail Discount */}
                <Grid item xs={12} md={6}>
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
                      <Box display="flex" alignItems="center" mb={3}>
                        <LocalOffer sx={{ fontSize: 30, mr: 2 }} />
                        <Typography variant="h5" fontWeight="bold">
                          Retail Discount
                        </Typography>
                      </Box>
                      <Grid container spacing={3}>
                        {/* Start Date */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Start Date"
                            type="date"
                            name="remise_prodique_start"
                            value={watch("remise_prodique_start")}
                            onChange={(e) => {
                              setValue("remise_prodique_start", e.target.value);
                              if (watch("remise_prodique_end") && e.target.value > watch("remise_prodique_end")) {
                                setValue("remise_prodique_end", "");
                              }
                            }}
                            InputLabelProps={{ shrink: true, style: { color: '#fff' } }}
                            InputProps={{
                              style: { color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
                            }}
                          />
                        </Grid>

                        {/* End Date */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="End Date"
                            type="date"
                            name="remise_prodique_end"
                            value={watch("remise_prodique_end")}
                            onChange={(e) => setValue("remise_prodique_end", e.target.value)}
                            InputLabelProps={{ shrink: true, style: { color: '#fff' } }}
                            inputProps={{
                              min: watch("remise_prodique_start"), // Disable dates before start date
                            }}
                            InputProps={{
                              style: { color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
                            }}
                          />
                        </Grid>

                        {/* Percentage */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Discount Percentage"
                            type="number"
                            name="remise_prodique_percentage"
                            value={watch("remise_prodique_percentage")}
                            onChange={(e) => setValue("remise_prodique_percentage", e.target.value)}
                            InputLabelProps={{ style: { color: '#fff' } }}
                            InputProps={{
                              endAdornment: <InputAdornment position="end" sx={{ color: '#fff' }}>%</InputAdornment>,
                              style: { color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
                            }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Wholesale Discount */}
                <Grid item xs={12} md={6}>
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, #ff7e5f, #feb47b)',
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
                      <Box display="flex" alignItems="center" mb={3}>
                        <LocalShipping sx={{ fontSize: 30, mr: 2 }} />
                        <Typography variant="h5" fontWeight="bold">
                          Wholesale Discount
                        </Typography>
                      </Box>
                      <Grid container spacing={3}>
                        {/* Start Date */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Start Date"
                            type="date"
                            name="remise_gros_start"
                            value={watch("remise_gros_start")}
                            onChange={(e) => {
                              setValue("remise_gros_start", e.target.value);
                              if (watch("remise_gros_end") && e.target.value > watch("remise_gros_end")) {
                                setValue("remise_gros_end", "");
                              }
                            }}
                            InputLabelProps={{ shrink: true, style: { color: '#fff' } }}
                            InputProps={{
                              style: { color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
                            }}
                          />
                        </Grid>

                        {/* End Date */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="End Date"
                            type="date"
                            name="remise_gros_end"
                            value={watch("remise_gros_end")}
                            onChange={(e) => setValue("remise_gros_end", e.target.value)}
                            InputLabelProps={{ shrink: true, style: { color: '#fff' } }}
                            inputProps={{
                              min: watch("remise_gros_start"), // Disable dates before start date
                            }}
                            InputProps={{
                              style: { color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
                            }}
                          />
                        </Grid>

                        {/* Percentage */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Discount Percentage"
                            type="number"
                            name="remise_gros_percentage"
                            value={watch("remise_gros_percentage")}
                            onChange={(e) => setValue("remise_gros_percentage", e.target.value)}
                            InputLabelProps={{ style: { color: '#fff' } }}
                            InputProps={{
                              endAdornment: <InputAdornment position="end" sx={{ color: '#fff' }}>%</InputAdornment>,
                              style: { color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' },
                            }}
                          />
                        </Grid>

                        {/* Minimum Quantity */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            label="Minimum Quantity"
                            type="number"
                            name="remise_gros_min_quantity"
                            value={watch("remise_gros_min_quantity")}
                            onChange={(e) => setValue("remise_gros_min_quantity", e.target.value)}
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

{activeStep === 4 && (
              <VariantsStep selectedVariants={selectedVariants} setSelectedVariants={setSelectedVariants} />
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
                {activeStep === steps.length - 1 ? "Create Product" : "Next"} 
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </AdminLayout>
  );
}
