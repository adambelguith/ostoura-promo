import { useEffect, useReducer, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getError } from '../../utils/error';
import Link from 'next/link';
import {
  SearchIcon,
  FilterIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  ClockIcon
} from '@heroicons/react/outline';

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
      return state;
  }
}

export default function AdminOrderScreen() {
  const [{ loading, error, orders, successDelete, loadingDelete }, dispatch] = useReducer(reducer, {
    loading: true,
    orders: [],
    error: '',
  });

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState('all');

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
    if (!window.confirm('Are you sure you want to delete this order?')) {
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

  const filteredOrders = orders.filter((order) => {
    const matchFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'delivered' && order.isDelivered) ||
      (selectedFilter === 'pending' && !order.isDelivered) ||
      (selectedFilter === 'paid' && order.isPaid) ||
      (selectedFilter === 'unpaid' && !order.isPaid);

    const searchRegExp = new RegExp(searchText, 'i');
    const matchSearch = 
      searchRegExp.test(order.shippingAddress.fullName) ||
      searchRegExp.test(order.shippingAddress.phone) ||
      searchRegExp.test(order.shippingAddress.city);

    return matchFilter && matchSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <select
              className="form-select rounded-lg border-gray-300"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <FilterPill
            active={selectedFilter === 'all'}
            onClick={() => setSelectedFilter('all')}
            count={orders.length}
          >
            All Orders
          </FilterPill>
          <FilterPill
            active={selectedFilter === 'pending'}
            onClick={() => setSelectedFilter('pending')}
            count={orders.filter(o => !o.isDelivered).length}
          >
            Pending
          </FilterPill>
          <FilterPill
            active={selectedFilter === 'delivered'}
            onClick={() => setSelectedFilter('delivered')}
            count={orders.filter(o => o.isDelivered).length}
          >
            Delivered
          </FilterPill>
          <FilterPill
            active={selectedFilter === 'paid'}
            onClick={() => setSelectedFilter('paid')}
            count={orders.filter(o => o.isPaid).length}
          >
            Paid
          </FilterPill>
          <FilterPill
            active={selectedFilter === 'unpaid'}
            onClick={() => setSelectedFilter('unpaid')}
            count={orders.filter(o => !o.isPaid).length}
          >
            Unpaid
          </FilterPill>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg">{error}</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{order._id.substring(20, 24)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.shippingAddress.fullName}</div>
                        <div className="text-sm text-gray-500">{order.shippingAddress.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.totalPrice} TND
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <OrderStatus isDelivered={order.isDelivered} deliveredAt={order.deliveredAt} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PaymentStatus isPaid={order.isPaid} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link href={`/order/${order._id}`}>
                          <a className="text-indigo-600 hover:text-indigo-900">View</a>
                        </Link>
                        <Link href={`/admin/orders/${order._id}`}>
                          <a className="text-blue-600 hover:text-blue-900">Edit</a>
                        </Link>
                        <button
                          onClick={() => deleteHandler(order._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function FilterPill({ children, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
        active
          ? 'bg-indigo-100 text-indigo-700'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {children}
      <span className="ml-2 bg-white px-2 py-0.5 rounded-full text-xs">
        {count}
      </span>
    </button>
  );
}

function OrderStatus({ isDelivered, deliveredAt }) {
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
      isDelivered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
    }`}>
      {isDelivered ? (
        <>
          <TruckIcon className="w-4 h-4 mr-1" />
          Delivered
        </>
      ) : (
        <>
          <ClockIcon className="w-4 h-4 mr-1" />
          Pending
        </>
      )}
    </div>
  );
}

function PaymentStatus({ isPaid }) {
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
      isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {isPaid ? (
        <>
          <CheckCircleIcon className="w-4 h-4 mr-1" />
          Paid
        </>
      ) : (
        <>
          <XCircleIcon className="w-4 h-4 mr-1" />
          Unpaid
        </>
      )}
    </div>
  );
}

AdminOrderScreen.auth = {
  permissions: ['manage_orders', 'view_orders']
};
