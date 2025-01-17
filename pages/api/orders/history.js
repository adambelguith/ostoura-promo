import { getSession } from 'next-auth/react';
import db from '../../../utils/db';

const handler = async (req, res) => {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).send({ message: 'signin required' });
  }
  await db.connect();
  try {
    const orders = await db.order.order.findMany({
      where: { userId: parseInt(session.user.id) }
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  } finally {
    await db.disconnect();
  }
};

export default handler;
