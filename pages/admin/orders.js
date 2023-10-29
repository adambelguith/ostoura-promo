import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useReducer, useState} from 'react';
import Layout from '../../components/Layout';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import { XCircleIcon } from '@heroicons/react/outline';
import { CheckCircleIcon } from '@heroicons/react/outline';


function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, orders: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
      case 'DELETE_REQUEST':
        return { ...state, loadingDelete: true };
      case 'DELETE_SUCCESS':
        return { ...state, loadingDelete: false, successDelete: true };
      case 'DELETE_FAIL':
        return { ...state, loadingDelete: false };
      case 'DELETE_RESET':
        return { ...state, loadingDelete: false, successDelete: false };
    default:
      state;
  }
}

export default function AdminOrderScreen() {
  const [{ loading, error, orders, successDelete}, dispatch] = useReducer(reducer, {
    loading: true,
    orders: [],
    error: '',
  });
  const [selectedFilter, setSelectedFilter] = useState('all'); 
  const [searchText, setSearchText] = useState('');

  

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/orders`);
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
  const deleteHandler = async (orderId) => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    try {
      dispatch({ type: 'DELETE_REQUEST' });
      await axios.delete(`/api/admin/orders/${orderId}`);
      dispatch({ type: 'DELETE_SUCCESS' });
      toast.success('Order deleted successfully');
    } catch (err) {
      dispatch({ type: 'DELETE_FAIL' });
      toast.error(getError(err));
    }
  };

  const handleSearchInputChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleFilterChange = (event) => {
    setSelectedFilter(event.target.value);
  };

  const filteredOrders = orders.filter((order) => {
    const matchFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'true' && order.isDelivered) ||
      (selectedFilter === 'false' && !order.isDelivered)||
      (selectedFilter === 'paid' && order.isPaid) ||
      (selectedFilter === 'npaid' && !order.isPaid)

    if (matchFilter) {
      const searchRegExp = new RegExp(searchText, 'i'); 
      const matchName = searchRegExp.test(order.shippingAddress.fullName);
      const matchPhone = searchRegExp.test(order.shippingAddress.phone);
      const matchCity = searchRegExp.test(order.shippingAddress.city);
      return  matchName || matchCity || matchPhone;
    }

    return false; 
  });

  return (
    <Layout title="Admin Dashboard">
       <div className="grid md:grid-cols-8 md:gap-3 ">
        <div className='mt-4'>
          <ul className='grid md:flex md:flex-col grid-cols-3 gap-4'>
          <hr className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 border-t border-gray-300 my-4' />
            <li className='text-left hover:scale-110 hover:translate-x-1.5'>
              <Link href="/admin/dashboard">Dashboard</Link>
            </li>
            <hr className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 border-t border-gray-300 my-4' />
            <li className='text-left hover:translate-x-1.5 text-left text-[#079afc]'>
              <Link href="/admin/orders"> 
              <a className="font-bold">Orders </a>
              </Link>
            </li>
            <hr className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 border-t border-gray-300 my-4' />
            <li className='text-left hover:scale-110 hover:translate-x-1.5'>
              <Link href="/admin/products">
              Products
              </Link>
            </li>
            <hr className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 border-t border-gray-300 my-4' />
            <li className='text-left hover:scale-110 hover:translate-x-1.5'>
              <Link href="/admin/users"> Users </Link>
            </li>
            <hr className='w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 border-t border-gray-300 my-4' />
            <li className='text-left hover:scale-110 hover:translate-x-1.5'>
              <Link href="/admin/category">Categories</Link>
            </li>
            <hr className='w-full sm:w-1/2 md:w-1/3 lg:w-1/1 xl:w-1/2 border-t border-gray-300 my-4' />
          </ul>
        </div>
        <div className="overflow-x-auto md:col-span-7">
        <div className="flex flex-col md:flex-row justify-between">
          <h1 className="mb-4 text-xl">Admin Orders</h1>
          <input
            className='w-64'
            type="text"
            id="searchInput"
            name="searchInput"
            placeholder='Search'
            value={searchText}
            onChange={handleSearchInputChange}
          />
          <div className='mt-4 md:mt-0'>
              <label htmlFor="filterSelect">Filter Orders:</label>
              <select
                id="filterSelect"
                name="filterSelect"
                value={selectedFilter}
                onChange={handleFilterChange}
              >
                <option value="all">All Orders</option>
                <option value="true">Delivered</option>
                <option value="false">Not Delivered</option>
                <option value="paid">Paid</option>
                <option value="npaid">Not Paid</option>
              </select>
            </div>
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
                    <th className="p-5 text-left">USER</th>
                    <th className="p-5 text-left">DATE</th>
                    <th className="p-5 text-left">TOTAL</th>
                    <th className="p-5 text-left">PHONE</th>
                    <th className="p-5 text-left">City</th>
                    <th className="p-5 text-left">ADDRESS</th>
                    <th className="p-5 text-left">Paid</th>
                    <th className="p-5 text-left">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((order) => (
                    <tr key={order._id} className="border-b">
                      <td className="p-5">{order._id.substring(0, 10)}</td>
                      <td className="p-5">
                        {order.shippingAddress.fullName}
                      </td>
                      <td className="p-5">
                        {order.createdAt.substring(0, 10)}
                      </td>
                      <td className="p-5">TND {order.totalPrice}</td>
                      <td className="p-5">{order.shippingAddress.phone}</td>
                      <td className="p-5">{order.shippingAddress.city}</td>
                      
                        {/* {order.isPaid
                          ? `${order.paidAt.substring(0, 10)}`
                          : 'not paid'} */}
                      
                      <td className="p-5">
                        {order.shippingAddress.address.length > 24 ? 
                        (order.shippingAddress.address.substring(0,20)+"...")
                        :(order.shippingAddress.address) }
                        {order.isDelivered
                          ? <p className='text-[#027206]'>{order.deliveredAt.split('T')[0]}</p>
                          :<p className='delivred'> not delivered </p>}
                      </td>
                      <td className="p-5">{order.isPaid ? 
                            <CheckCircleIcon className="h-5 w-5 text-green-500"></CheckCircleIcon> : 
                            <XCircleIcon className="h-5 w-5 text-red-500"></XCircleIcon>}</td>
                      <td className="p-5 flex justify-between">
                        <div className='details-order-admin' >
                        <Link href={`/order/${order._id}`} passHref>
                          <a>Details</a>
                        </Link>
                        </div>
                        <div>
                        <Link href={`/admin/orders/${order._id}`} passHref>
                          <a type="button" className="default-button">
                            Edit
                          </a>
                        </Link>
                        &nbsp;
                        <button
                          type="button"
                          className="default-button"
                          onClick={() => deleteHandler(order._id)}
                        >
                          Delete
                        </button>
                        </div>
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

AdminOrderScreen.auth = { adminOnly: true };
