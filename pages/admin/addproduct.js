import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useReducer,useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { getError } from '../../utils/error';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { XCircleIcon } from '@heroicons/react/outline';


function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, dataCategory: action.payload, error: '' };
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
 
  const [uploaded, setUploaded] =useState(null);
  const [displayImage , setDisplayImage] = useState(false)
   const [imageFiles , setImageFiles] = useState([])
   const [videoBase, setVideoBase] = useState('');
   const [categoryList, setCategoryList] = useState([])
   const [selectedcategory, setSelectedcategory] = useState([])
   const [subcategoryList, setSubcategoryList] = useState([])

  const [{ loading, error, loadingUpdate, loadingUpload, dataCategory}, dispatch] =
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
    try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/categories/listcat`);
        const nameCtegory =  data.map((category) => category.name)
        setCategoryList(nameCtegory)
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }  
    }
    fetchData();
} , [ ]);

useEffect(() => {
 if (selectedcategory){
  const fetchData = async () => {
  try {
      dispatch({ type: 'FETCH_REQUEST' });
      const { data } = await axios.get(`/api/admin/categories/listsub?category=${selectedcategory}`);
      const namesubCtegory =  data.map((subcategory) => subcategory.name)
      setSubcategoryList(namesubCtegory)
    } catch (err) {
      console.log(err);
    }  
  }
  fetchData();
}
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
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload/`,
          {
            method: 'POST',
            body: formData,
          }
        );
        dispatch({ type: 'UPLOAD_SUCCESS' });
        setDisplayImage(true)
        toast.success(`Image ${i} uploaded successfully`);
        return await response.json();
        
      })
    );
  };
  useEffect (() =>{
  
    setValue('image', imageFiles)
  
  },[imageFiles])
  const getPublicIdFromUrl = (url) => {
    const regex = /\/v\d+\/([^/]+)\.\w{3,4}$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };
  

 const deleteimages = async (index) =>{
  const imageindex = imageFiles[index].split('/').pop().split('.')[0]
 
 const {
  data: { signature, timestamp },
 } = await axios('/api/admin/cloudinary-sign');
 const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`;
 try {
 const response = await fetch(url, {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    public_id: imageindex,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
  }),
});

if (response.ok) {
  console.log(`Image with public ID ${imageindex} deleted successfully.`);
} else {
  console.error('Error deleting image:', response.statusText);
}
}catch (error) {
  console.error('Fetch error:', error);
}
//  try {
//   const formData = new FormData();
//         formData.append('signature', signature);
//         formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
//         formData.append('timestamp', timestamp);
//         const response = await axios.delete(url,formData)
//   const updatedList = [...imageFiles];

//   updatedList.splice(index, 1); 
//   setImageFiles(updatedList); 

//   console.log(response);

// } catch (error) {
//   console.error(error);
// }
//  try {
//    const response = await fetch('/api/admin/images', {
//      method: 'DELETE',
//      headers: {
//        'Content-Type': 'application/json',
//      },
//      body: JSON.stringify({ imageindex }),
//    });

//    if (response.ok) {
//      const data = await response.json();
//    } else {
//      console.error('Failed to delete element');
//    }
//  } catch (error) {
//    console.error('Error deleting element:', error);
//    toast.error(error)
//  }
 }

  const videoHandler = async (e) => {
    const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload/`;
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


const onSelectFile = async (event) =>  {

event.preventDefault();
const imageData = await uploadHandler(event.target.files);
const imageUrl = imageData.map((data)=> data.url);
setValue('image',imageUrl);
setImageFiles(prevItems => {
  if (Array.isArray(prevItems)) {
    return [...prevItems, ...imageUrl];
  } else {
    return [...prevItems]; 
  }
});
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
      await axios.post(`/api/admin/products`, data);
      dispatch({ type: 'UPDATE_SUCCESS' });
      toast.success('Product updated successfully');
      router.push('/admin/products');
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  };

  return (
    <Layout title={`Add Product`}>
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
            <li className='text-left hover:translate-x-1.5 text-left text-[#079afc]'>
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
            <form
              className="mx-auto max-w-screen-md"
              onSubmit={handleSubmit(submitHandler)}
            >
              <h1 className="mb-4 text-xl"></h1>
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
                {console.log(imageFiles)}
                {/* {displayImage && 
                <div className='flex flex-wrap space-x-4 mt-6'>
                {imageFiles.map((imageData, index) => (
                  <div key={index} className='m-4 ' >
                  <span className='' onClick={() => deleteimages(index)}><XCircleIcon className="h-5 w-5"></XCircleIcon></span>
                      <img className='rounded-md' src={imageData} alt={`Image ${index}`} height={128}  width={128}/>
                  </div>
                ))}
                </div>} */}
                {displayImage && 
                <div className='flex flex-wrap space-x-4 mt-6'>
                {imageFiles.map((imageData, index) => (
                  <div key={index} className='m-4 ' >
                  <span className='cross-stand-alone ' onClick={() => deleteimages(index)}></span>
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
                  id="video" 
                  onKeyDown={(event) => {
                    event.preventDefault();
                  }}
                  {...register('video')}
                />
                {errors.video && (
                  <div className="text-red-500">{errors.video.message}</div>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="videoFile">Upload Video</label>
                <input
                  type="file"
                  className="w-full"
                  id="videoFile"
                  onChange={videoHandler}
                />

                {loadingUpload && <div>Uploading.... {uploaded/10}%</div>}
                {videoBase && (
                    <div>
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
                      options={categoryList}
                      sx={{ width: 300 }}
                      onChange={(event, params)=> setSelectedcategory(params) }
                      renderInput={(params) => <TextField {...params} label="Category" {...register('category', {
                        required: 'Please enter category',
                      })} />}
                      
                    />
                    {errors.category && (
                  <div className="text-red-500">{errors.category.message}</div>
                )}
              </div> 

              <div className="mb-4">
                <label htmlFor="subcategory">Subcategory</label>
                  <Autocomplete
                      disablePortal
                      id="subcategory"
                      options={subcategoryList}
                      sx={{ width: 300 }}
                      renderInput={(params) => <TextField {...params} label="subcategory" {...register('subcategory', {
                        required: 'Please enter subcategory',
                      })} />}
                      
                    />
                    {errors.subcategory && (
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
                <button disabled={loadingUpdate} onClick={handleSubmit(submitHandler)} className="primary-button">
                  Add Product
                </button>
              </div>
              <div className="mb-4">
                <Link href={`/admin/products`}>Back</Link>
              </div>
            </form>
          
        </div>
      </div>
    </Layout>
  );
}

AdminProductEditScreen.auth = { adminOnly: true };







