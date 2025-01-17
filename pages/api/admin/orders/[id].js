import { orderPrisma } from '../../../../lib/prisma';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  
  if (!session?.user?.permissions?.some(perm => 
    ['manage_orders', 'view_orders'].includes(perm)
  )) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        const order = await orderPrisma.order.findUnique({
          where: { id },
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

        if (!order) {
          return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(order);
      } catch (error) {
        console.error('Order fetch error:', error);
        res.status(500).json({ message: 'Error fetching order' });
      }
      break;

    case 'PUT':
      try {
        const { status, isPaid, isDelivered } = req.body;
        
        const updatedOrder = await orderPrisma.order.update({
          where: { id },
          data: {
            status,
            isPaid,
            isDelivered,
            ...(isPaid && { paidAt: new Date() }),
            ...(isDelivered && { deliveredAt: new Date() }),
            updated_at: new Date()
          }
        });

        res.status(200).json(updatedOrder);
      } catch (error) {
        console.error('Order update error:', error);
        res.status(500).json({ message: 'Error updating order' });
      }
      break;

    case 'DELETE':
      try {
        await orderPrisma.order.delete({
          where: { id }
        });

        res.status(200).json({ message: 'Order deleted successfully' });
      } catch (error) {
        console.error('Order deletion error:', error);
        res.status(500).json({ message: 'Error deleting order' });
      }
      break;

    default:
      res.status(405).json({ message: 'Method not allowed' });
  }
} 