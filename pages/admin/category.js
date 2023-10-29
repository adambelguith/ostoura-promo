import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useReducer,useState } from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { getError } from '../../utils/error';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, categories: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreate: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false };
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

function AdminCategoriesScreen() {
  const [{ loading, error, categories, loadingCreate,successDelete, loadingDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      categories: [],
      error: '',
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredcategory, setFilteredProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/categories`);
        setFilteredProducts(data)
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [successDelete]);

  useEffect(() => {
    const filtered = categories.filter((category) => {
      const lowerCaseQuery = searchQuery.toLowerCase();
      return (
        category.name.toLowerCase().includes(lowerCaseQuery) ||
        category.category.toLowerCase().includes(lowerCaseQuery)
      );
    });

    setFilteredProducts(filtered);
  }, [searchQuery, categories]);

  const deleteHandler = async (categoryId) => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    try {
      dispatch({ type: 'DELETE_REQUEST' });
      await axios.delete(`/api/admin/categories/${categoryId}`);
      dispatch({ type: 'DELETE_SUCCESS' });
      toast.success('Category deleted successfully');
    } catch (err) {
      dispatch({ type: 'DELETE_FAIL' });
      toast.error(getError(err));
    }
  };

  return (
    <Layout title="Categories">
     <div className="grid md:grid-cols-6 md:gap-3 ">
        <div className='mt-4'>
          <ul className='grid md:flex md:flex-col grid-cols-3 gap-4'>
            <hr className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 border-t border-gray-300 my-4' />
            <li className=' text-left hover:scale-110 hover:translate-x-1.5'>
              <Link href="/admin/dashboard">Dashboard</Link>
            </li>
            <hr className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 border-t border-gray-300 my-4' />
            <li className=' text-left hover:scale-110 hover:translate-x-1.5'>
              <Link href="/admin/orders">Orders</Link>
            </li>
            <hr className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 border-t border-gray-300 my-4' />
            <li className=' text-left hover:scale-110 hover:translate-x-1.5'>
              <Link href="/admin/products"> Products </Link>
            </li>
            <hr className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 border-t border-gray-300 my-4' />
            <li className=' text-left hover:scale-110 hover:translate-x-1.5'>
              <Link href="/admin/users">Users</Link>
            </li>
            <hr className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 border-t border-gray-300 my-4' />
            <li className=' text-left hover:translate-x-1.5 text-left text-[#079afc]'>
              <Link href="/admin/category">
                <a className="font-bold">categories</a>
              </Link>
            </li>
            <hr className='w-full sm:w-1/2 md:w-1/3 lg:w-1/1 xl:w-1/2 border-t border-gray-300 my-4' />
          </ul>
        </div>
        <div className="overflow-x-auto md:col-span-5">
            <div className="flex flex-col sm:flex-row justify-between">
                <h1 className="mb-4 text-xl">categories</h1>
                <input
              className='w-64'
              type="text"
              placeholder="Search by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
                {loadingDelete && <div>Deleting...</div>}
                <Link href={`/admin/addCategory`}>
                    <a type="button" className="default-button w-20 mt-4 sm:mt-0">
                    {loadingCreate ? 'Loading' : 'Create'}
                    </a>
                </Link>
            </div>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="alert-error">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b">
                  <tr>
                    <th className="px-5 text-left">ID</th>
                    <th className="p-5 text-left pl-28">Category</th>
                    <th className="p-5 text-left pl-28">Subcategory</th>
                    <th className="p-5 text-left pl-52">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredcategory.slice().reverse().map((category) => (
                    <tr key={category._id} className="border-b">
                      <td className=" p-5 ">{category._id.substring(0, 10)}</td>
                      <td className=" p-5 pl-28">{category.category}</td>
                      <td className=" p-5 pl-28">{category.name}</td>
                      <td className=" p-5 pl-44">
                        <Link href={`/admin/category/${category._id}`} passHref>
                          <a type="button" className="default-button">
                            Edit
                          </a>
                        </Link>
                        &nbsp;
                        <button
                          type="button"
                          className="default-button"
                          onClick={() => deleteHandler(category._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

AdminCategoriesScreen.auth = { adminOnly: true };
export default AdminCategoriesScreen;
