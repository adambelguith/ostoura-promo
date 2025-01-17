import { orderPrisma } from '../../../../lib/prisma';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session?.user?.permissions?.some(perm => 
    ['manage_orders', 'view_orders'].includes(perm)
  )) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const orders = await orderPrisma.order.findMany({
        orderBy: {
          created_at: 'desc'
        },
        select: {
          id: true,
          userId: true,
          status: true,
          amount: true,
          isPaid: true,
          isDelivered: true,
          paidAt: true,
          deliveredAt: true,
          created_at: true,
          updated_at: true
        }
      });

      res.status(200).json(orders);
    } catch (error) {
      console.error('Order fetch error:', error);
      res.status(500).json({ message: 'Error fetching orders' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
