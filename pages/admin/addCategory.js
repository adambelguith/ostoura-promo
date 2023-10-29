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
export default function AdminCategoryEditScreen() {
 

  const [{ loading, error, loadingUpdate, loadingUpload}, dispatch] =
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
  const [categoryList, setCategoryList] = useState([])

//   useEffect(() => {
//     const fetchData = async () => {
//     try {
//         dispatch({ type: 'FETCH_REQUEST' });
//         const { data } = await axios.get(`/api/admin/categories`);
//         const nameCtegory =  data.map((category) => category.name)
//         setCategoryList(nameCtegory)
//         dispatch({ type: 'FETCH_SUCCESS', payload: data });
//       } catch (err) {
//         dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
//       }  
//     }
//     fetchData();
// } , [ ]);

useEffect(() => {
    const fetchCategory = async () => {
    try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/categories/listcat`);
        const nameCtegory =  data.map((category) => category.name)
        console.log(nameCtegory)
        setCategoryList(nameCtegory)
        // dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }  
    }
    fetchCategory();
} , [ ]);

  const router = useRouter();

  
 
const submitHandler = async ({
    category,
    subcategory,
  }) => {
    try {
      const data = {
        category,
        subcategory,
      }
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.post(`/api/admin/categories`, data);
      dispatch({ type: 'UPDATE_SUCCESS' });
      toast.success('Product updated successfully');
      router.push('/admin/category');
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
            <li className='text-left hover:scale-110 hover:translate-x-1.5'>
              <Link href="/admin/products"> Products</Link>
            </li>
            <hr className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 border-t border-gray-300 my-4' />
            <li className='text-left hover:scale-110 hover:translate-x-1.5'>
              <Link href="/admin/users">Users</Link>
            </li>
            <hr className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 border-t border-gray-300 my-4' />
            <li className='text-left hover:scale-110 hover:translate-x-1.5 hover:translate-x-1.5 text-left text-[#079afc]'>
              <Link href="/admin/category">
              <a className="font-bold"> Categories</a>
                </Link>
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
                <label htmlFor="category">category</label>
                  <Autocomplete
                       disablePortal
                      id="category"
                    //   defaultValue={nameCtegory}
                    //   onChange={(event, value) => setNameCategory(value)}
                      options={categoryList}
                      sx={{ width: 300 }}
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
                <input
                  type="text"
                  className="w-full"
                  id="subcategory"
                  {...register('subcategory', {
                    required: 'Please enter subcategory',
                  })}
                />
                {errors.subcategory && (
                  <div className="text-red-500">{errors.subcategory.message}</div>
                )}
              </div>
        
              <div className="mb-4">
                <button disabled={loadingUpdate} onClick={handleSubmit(submitHandler)} className="primary-button">
                  Add Category
                </button>
              </div>
              <div className="mb-4">
                <Link href={`/admin/category`}>Back</Link>
              </div>
            </form>
          
        </div>
      </div>
    </Layout>
  );
}

AdminCategoryEditScreen.auth = { adminOnly: true };

