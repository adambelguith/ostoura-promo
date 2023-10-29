import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useReducer,useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Layout from '../../../components/Layout';
import { getError } from '../../../utils/error';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

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
      return {
        ...state,
        loadingUpload: false,
        errorUpload: '',
      };
    case 'UPLOAD_FAIL':
      return { ...state, loadingUpload: false, errorUpload: action.payload };

    default:
      return state;
  }
}
export default function AdminProductEditScreen() {
 
  const { query } = useRouter();
  const productId = query.id;
  const [categoryList, setCategoryList] = useState([])
  const [subcategoryList, setSubcategoryList] = useState([])
  const [uploaded, setUploaded] =useState(null);
  const [displayImage , setDisplayImage] = useState(false)
  const [imageFiles , setImageFiles] = useState([])
  const [videoBase, setVideoBase] = useState('');
  const [categoryvalue , setCategoryValue] = useState()
  const [subcategoryvalue , setSubcategoryValue] = useState()
  const [selectedcategory, setSelectedcategory] = useState([])
  

  const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios.get(`/api/admin/products/${productId}`);
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        dispatch({ type: 'FETCH_SUCCESS' });
        setValue('name', data.name);
        setValue('slug', data.slug);
        setValue('price', data.price);
        setValue('promotion', data.promotion);
        setValue('image', data.image);
        setValue('video',data.video)
        setValue('category', data.category);
        setValue('subcategory', data.subcategory);
        setValue('brand', data.brand);
        setValue('countInStock', data.countInStock);
        setValue('description', data.description);
        if(data.image){
          setDisplayImage(true)
          setImageFiles(data.image)
        }
        if(data.video){
          setVideoBase(data.video)
        }
        setCategoryValue(data.category)
        setSelectedcategory(data.category)
        setSubcategoryValue(data.subcategory)
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    fetchData();
  }, [productId]);

  useEffect(() => {
    const fetchData = async () => {
    try {
        const { data } = await axios.get(`/api/admin/categories/listcat`);
        const nameCtegory =  data.map((category) => category.name)
        setCategoryList(nameCtegory)
      } catch (err) {
       console.log(err)
      }  
    }
    fetchData();
} , [ ]);

useEffect(() => {
  const fetchData = async () => {
    if(selectedcategory){
      try {
        const { data } = await axios.get(`/api/admin/categories/listsub?category=${selectedcategory}`);
        const nameCtegory =  data.map((category) => category.name)
        setSubcategoryList(nameCtegory)
      } catch (err) {
        console.log(err)
      }  
    }
 
  }
  fetchData();
} , [selectedcategory ]);


  const router = useRouter();

  const uploadHandler = async (imagess) => {
    const images = Array.from(imagess);
    return await Promise.all(
images.map(async (image,i) => {
  dispatch({ type: 'UPLOAD_REQUEST' });
        const {
         data: { signature, timestamp },
        } = await axios('/api/admin/cloudinary-sign');
        const formData = new FormData();
        formData.append('file', image);
        formData.append('signature', signature);
        formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
        formData.append('timestamp', timestamp);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );
        dispatch({ type: 'UPLOAD_SUCCESS' });
        toast.success(`Image ${i} uploaded successfully`);
        return await response.json();
        
      })
    );
  };


  const videoHandler = async (e) => {
    const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;
    try {
      dispatch({ type: 'UPLOAD_REQUEST' });
      const {
        data: { signature, timestamp },
      } = await axios('/api/admin/cloudinary-sign');

      const formData = new FormData();
      formData.append('file', e.target.files[0]);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
      const { data } = await axios.post(url, formData,{
        onUploadProgress: (data) => {
          setUploaded(Math.round((data.loaded /data.total)*1000))
        },
      });
      dispatch({ type: 'UPLOAD_SUCCESS' });
      setValue('video',data.secure_url);
      setVideoBase(data.secure_url)
      toast.success('Video uploaded successfully');
    } catch (err) {
      dispatch({ type: 'UPLOAD_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  };        

useEffect (() =>{
  
  setValue('image', imageFiles)

},[imageFiles])
const handleDeleteImage  = async (index) =>{
  const updatedList = [...imageFiles];
  const imageindex = imageFiles[index].split('/').pop().split('.')[0]
 updatedList.splice(index, 1); 
 setImageFiles(updatedList); 
 
 try {
   const response = await fetch('/api/admin/images', {
     method: 'DELETE',
     headers: {
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({ imageindex }),
   });

   if (response.ok) {
     const data = await response.json();
     console.log(data.message); 
   } else {
     console.error('Failed to delete element');
   }
 } catch (error) {
   console.error('Error deleting element:', error);
   toast.error(error)
 }
}

  

const onSelectFile = async (event) =>  {

event.preventDefault();
const imageData = await uploadHandler(event.target.files);
const imageUrl = imageData.map((data)=>data.url);
setImageFiles(prevItems => {
  if (Array.isArray(prevItems)) {
    return [...prevItems, ...imageUrl];
  } else {
    return [...prevItems]; 
  }
});
setValue('image',imageFiles);

};
  const submitHandler = async ({
    name,
    slug,
    price,
    promotion,
    category,
    subcategory,
    image,
    video,
    brand,
    countInStock,
    description,
  }) => {
    try {
      const data = {
        name,
        slug,
        price,
        promotion,
        category,
        subcategory,
        image,
        video,
        brand,
        countInStock,
        description,
      }
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(`/api/admin/products/${productId}`, data);
      dispatch({ type: 'UPDATE_SUCCESS' });
      toast.success('Product updated successfully');
      router.push('/admin/products');
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  };

  return (
    <Layout title={`Edit Product ${productId}`}>
     <div className="grid md:grid-cols-6 md:gap-3 ">
        <div className='mt-4'>
          <ul className='grid md:flex md:flex-col grid-cols-3 gap-4'>
          <hr className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 border-t border-gray-300 my-4' />
            <li className='text-left hover:scale-110 hover:translate-x-1.5'>
              <Link href="/admin/dashboard">Dashboard</Link>
            </li>
            <hr className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 border-t border-gray-300 my-4' />
            <li className='text-left hover:scale-110 hover:translate-x-1.5'>
              <Link href="/admin/orders">Orders</Link>
            </li>
            <hr className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 border-t border-gray-300 my-4' />
            <li className='text-left hover:scale-110 hover:translate-x-1.5 hover:translate-x-1.5 text-left text-[#079afc]'>
              <Link href="/admin/products">
                <a className="font-bold">Products</a>
              </Link>
            </li>
            <hr className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 border-t border-gray-300 my-4' />
            <li className='text-left hover:scale-110 hover:translate-x-1.5'>
              <Link href="/admin/users">Users</Link>
            </li>
            <hr className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 border-t border-gray-300 my-4' />
            <li className='text-left hover:scale-110 hover:translate-x-1.5'>
              <Link href="/admin/category">Categories</Link>
            </li>
            <hr className='w-full sm:w-1/2 md:w-1/3 lg:w-1/1 xl:w-1/2 border-t border-gray-300 my-4' />
          </ul>
        </div>
        <div className="md:col-span-5">
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="alert-error">{error}</div>
          ) : (
            <form
              className="mx-auto max-w-screen-md"
              onSubmit={handleSubmit(submitHandler)}
            >
              <h1 className="mb-4 text-xl">{`Edit Product ${productId}`}</h1>
              <div className="mb-4">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  className="w-full"
                  id="name"
                  autoFocus
                  {...register('name', {
                    required: 'Please enter name',
                  })}
                />
                {errors.name && (
                  <div className="text-red-500">{errors.name.message}</div>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="slug">Slug</label>
                <input
                  type="text"
                  className="w-full"
                  id="slug"
                  {...register('slug', {
                    required: 'Please enter slug',
                  })}
                />
                {errors.slug && (
                  <div className="text-red-500">{errors.slug.message}</div>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="price">Price</label>
                <input
                  type="text"
                  className="w-full"
                  id="price"
                  {...register('price', {
                    required: 'Please enter price',
                  })}
                />
                {errors.price && (
                  <div className="text-red-500">{errors.price.message}</div>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="promotion">Promotion</label>
                <input
                  type="text"
                  className="w-full"
                  id="promotion"
                  {...register('promotion')}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="image">image</label>
                <input
                  type="text"
                  className="w-full"
                  onKeyDown={(event) => {
                    event.preventDefault();
                  }}
                  id="image" 
                  {...register('image', {
                    required: 'Please enter image',
                  })}
                  
                />
                {errors.image && (
                  <div className="text-red-500">{errors.image.message}</div>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="imageFile">Upload image</label>
                <input
                  type="file"
                  className="w-full"
                  id="imageFile"
                  multiple 
                  onChange={onSelectFile}
                />

            {displayImage && 
                <div className='flex flex-wrap space-x-4 mt-6'>
                {imageFiles.map((imageData, index) => (
                  <div key={index} className='m-4 ' >
                  <span className='cross-stand-alone ' onClick={() => handleDeleteImage(index)}></span>
                      <img className='rounded-md' src={imageData} alt={`Image ${index}`} height={128}  width={128}/>                     
                  </div>
                ))}
                </div>}
              </div>

              <div className="mb-4">
                <label htmlFor="video">video</label>
                <input
                  type="text"
                  className="w-full"
                  onKeyDown={(event) => {
                    event.preventDefault();
                  }}
                  id="video" 
                  {...register('video')}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="videoFile">Upload Video</label>
                <input
                  type="file"
                  className="w-full"
                  id="videoFile"
                  multiple 
                  onChange={videoHandler}
                />

                {loadingUpload && <div>Uploading.... {uploaded}</div>}
                {videoBase && (
                    <div className='mt-4'>
                      <video controls width="300">
                        <source src={videoBase} type="video/mp4" />
                      </video>
                    </div>
                  )}
              </div>



              <div className="mb-4">
                <label htmlFor="category">category</label>
                  <Autocomplete
                      disablePortal
                      id="category"
                      defaultValue={categoryvalue}
                      options={categoryList}
                      sx={{ width: 300 }}
                      onChange={(event, params)=> setSelectedcategory(params)}
                      renderInput={(params) => <TextField {...params}  {...register('category', {
                        required: 'Please enter category',
                      })} />}
                      
                    />
                    {errors.category && (
                  <div className="text-red-500">{errors.category.message}</div>
                )}
              </div> 
              <div className="mb-4">
                <label htmlFor="subcategory">subcategory</label>
                <Autocomplete
                      disablePortal
                      id="subcategory"
                      options={subcategoryList}
                      defaultValue={subcategoryvalue}
                      sx={{ width: 300 }}
                      renderInput={(params) => <TextField {...params} label="subcategory" {...register('subcategory', {
                        required: 'Please enter subcategory',
                      })} />}
                      
                    />
                {errors.category && (
                  <div className="text-red-500">{errors.subcategory.message}</div>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="brand">brand</label>
                <input
                  type="text"
                  className="w-full"
                  id="brand"
                  {...register('brand', {
                    required: 'Please enter brand',
                  })}
                />
                {errors.brand && (
                  <div className="text-red-500">{errors.brand.message}</div>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="countInStock">countInStock</label>
                <input
                  type="text"
                  className="w-full"
                  id="countInStock"
                  {...register('countInStock', {
                    required: 'Please enter countInStock',
                  })}
                />
                {errors.countInStock && (
                  <div className="text-red-500">
                    {errors.countInStock.message}
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="countInStock">description</label>
                <textarea
                rows={5}
                  type="text"
                  className="w-full"
                  id="description"
                  {...register('description', {
                    required: 'Please enter description',
                  })}
                />
                {errors.description && (
                  <div className="text-red-500">
                    {errors.description.message}
                  </div>
                )}
              </div>
              <div className="mb-4">
                <button disabled={loadingUpdate} className="primary-button">
                  {loadingUpdate ? 'Loading' : 'Update'}
                </button>
              </div>
              <div className="mb-4">
                <Link href={`/admin/products`}>Back</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}

AdminProductEditScreen.auth = { adminOnly: true };







