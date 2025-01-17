import { mysqlPrisma, userPrisma, orderPrisma } from '../../../lib/prisma';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    if (!session?.user?.permissions?.includes('manage_users')) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Single query for orders with all needed data
    const orders = await orderPrisma.order.findMany({
      select: {
        id: true,
        amount: true,
        status: true,
        created_at: true,
        userId: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Get counts
    const [productsCount, usersCount] = await Promise.all([
      mysqlPrisma.product.count(),
      userPrisma.user.count()
    ]);

    // Calculate all order-related stats from the single orders query
    const ordersCount = orders.length;
    const ordersPrice = orders.reduce((sum, order) => sum + (Number(order.amount) || 0), 0);
    const ordersPending = orders.filter(o => o.status === 'pending').length;
    const ordersProcessing = orders.filter(o => o.status === 'processing').length;
    const ordersShipped = orders.filter(o => o.status === 'shipped').length;
    const ordersDelivered = orders.filter(o => o.status === 'delivered').length;

    // Get recent orders (first 5 from already fetched orders)
    const recentOrders = orders.slice(0, 5);

    // Get unique userIds from recent orders
    const userIds = [...new Set(recentOrders.map(order => order.userId))];

    // Get usernames for recent orders
    const users = await userPrisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true }
    });

    const userMap = Object.fromEntries(users.map(user => [user.id, user.username]));

    // Calculate sales data from orders
    const salesByMonth = orders.reduce((acc, order) => {
      const month = order.created_at.toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + Number(order.amount);
      return acc;
    }, {});

    const salesData = Object.entries(salesByMonth)
      .map(([_id, totalSales]) => ({ _id, totalSales }))
      .sort((a, b) => b._id.localeCompare(a._id))
      .slice(0, 6);

    res.status(200).json({
      ordersCount,
      productsCount,
      usersCount,
      ordersPrice,
      ordersPending,
      ordersProcessing,
      ordersShipped,
      ordersDelivered,
      salesData,
      recentOrders: recentOrders.map(order => ({
        _id: order.id,
        user: userMap[order.userId] || 'Unknown',
        status: order.status,
        total: Number(order.amount).toFixed(2)
      }))
    });
  } catch (error) {
    console.error('Summary API Error:', error);
    res.status(500).json({ 
      message: 'Error fetching summary data', 
      error: error.message 
    });
  }
}
