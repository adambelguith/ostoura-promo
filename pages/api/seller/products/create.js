import { isAuth, hasRole } from '../../../../middleware/jwt';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  await isAuth(req, res, async () => {
    await hasRole(['seller'])(req, res, async () => {
      if (req.method === 'POST') {
        return createHandler(req, res);
      }
      return res.status(405).json({ message: 'Method not allowed' });
    });
  });
};

const createHandler = async (req, res) => {
  await db.connect();
  try {
    const product = await db.mysql.product.create({
      data: {
        ...req.body,
        sellerId: req.user.id,
        status: 'pending'
      }
    });

    // Notify admin about new product (you can implement email notification here)

    res.status(201).json({
      message: 'Product created and pending admin approval',
      product
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error creating product' });
  } finally {
    await db.disconnect();
  }
};

export default handler; 