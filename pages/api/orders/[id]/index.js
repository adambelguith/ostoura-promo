import db from '../../../../utils/db';

const handler = async (req, res) => {
  await db.connect();

  try {
    const order = await db.order.order.findUnique({
      where: { id: parseInt(req.query.id) }
    });
    
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
    } else {
      res.status(200).json(order);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error fetching order' });
  } finally {
    await db.disconnect();
  }
};

export default handler;
