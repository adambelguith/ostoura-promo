import { useEffect, useReducer } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import axios from 'axios';
import { 
  TrendingUpIcon, 
  TrendingDownIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon
} from '@heroicons/react/outline';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, summary: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export default function AdminDashboardScreen() {
  const { data: session } = useSession();
  const router = useRouter();
  const [{ loading, error, summary }, dispatch] = useReducer(reducer, {
    loading: true,
    summary: {},
    error: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get('/api/admin/summary');
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }
    };
    fetchData();
  }, []);

  const salesData = {
    labels: summary.salesData?.map(x => x._id) || [],
    datasets: [
      {
        label: 'Sales',
        data: summary.salesData?.map(x => x.totalSales) || [],
        fill: true,
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4
      }
    ]
  };

  const orderStatusData = {
    labels: ['Pending', 'Processing', 'Shipped', 'Delivered'],
    datasets: [{
      data: [
        summary.ordersPending || 0,
        summary.ordersProcessing || 0,
        summary.ordersShipped || 0,
        summary.ordersDelivered || 0
      ],
      backgroundColor: ['#FCD34D', '#60A5FA', '#34D399', '#4F46E5']
    }]
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <div className="flex space-x-3">
            <select className="form-select rounded-lg border-gray-300">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Download Report
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg">{error}</div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Revenue"
                value={`${summary.ordersPrice || 0} TND`}
                trend={+10.2}
                icon={CurrencyDollarIcon}
                color="indigo"
              />
              <StatCard
                title="Total Orders"
                value={summary.ordersCount || 0}
                trend={+5.4}
                icon={ShoppingCartIcon}
                color="blue"
              />
              <StatCard
                title="Total Products"
                value={summary.productsCount || 0}
                trend={-2.4}
                icon={ShoppingBagIcon}
                color="green"
              />
              <StatCard
                title="Total Customers"
                value={summary.usersCount || 0}
                trend={+12.5}
                icon={UserGroupIcon}
                color="purple"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
                <Line data={salesData} options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true }
                  }
                }} />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Order Status</h2>
                <Doughnut data={orderStatusData} options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'bottom' }
                  }
                }} />
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold">Recent Orders</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {summary.recentOrders?.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">#{order._id.slice(-4)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{order.user}</td>
                        <td className="px-6 py-4">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{order.total} TND</td>
                        <td className="px-6 py-4 text-sm text-gray-500">Today at 2:38 PM</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, trend, icon: Icon, color }) {
  const colors = {
    indigo: 'text-indigo-600 bg-indigo-50',
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50'
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-full ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center space-x-1 text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend > 0 ? <TrendingUpIcon className="w-4 h-4" /> : <TrendingDownIcon className="w-4 h-4" />}
          <span>{Math.abs(trend)}%</span>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}

function OrderStatusBadge({ status }) {
  const colors = {
    pending: 'bg-yellow-50 text-yellow-600',
    processing: 'bg-blue-50 text-blue-600',
    shipped: 'bg-green-50 text-green-600',
    delivered: 'bg-indigo-50 text-indigo-600'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
      {status}
    </span>
  );
}

AdminDashboardScreen.auth = {
  permissions: ['manage_users']
};
