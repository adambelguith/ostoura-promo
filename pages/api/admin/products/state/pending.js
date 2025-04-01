import { isAuth, isAdmin } from '../../../../../middleware/jwt';
import db from '../../../../../utils/db';

const handler = async (req, res) => {
  await isAuth(req, res, async () => {
    await isAdmin(req, res, async () => {
      if (req.method === 'GET') {
        return getPendingHandler(req, res);
      }
      return res.status(405).json({ message: 'Method not allowed' });
    });
  });
};

const getPendingHandler = async (req, res) => {
  await db.connect();
  try {
    const pendingProducts = await db.mysql.product.findMany({
      where: { status: 'pending' },
      include: {
        category: true
      }
    });

    res.status(200).json(pendingProducts);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error fetching pending products' });
  } finally {
    await db.disconnect();
  }
};

export default handler; 