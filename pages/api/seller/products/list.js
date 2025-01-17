import { isAuth, hasRole } from '../../../../middleware/jwt';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  await isAuth(req, res, async () => {
    await hasRole(['seller'])(req, res, async () => {
      if (req.method === 'GET') {
        return getSellerProductsHandler(req, res);
      }
      return res.status(405).json({ message: 'Method not allowed' });
    });
  });
};

const getSellerProductsHandler = async (req, res) => {
  await db.connect();
  try {
    const products = await db.mysql.product.findMany({
      where: { 
        sellerId: req.user.id 
      },
      include: {
        category: true
      }
    });

    res.status(200).json(products);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error fetching seller products' });
  } finally {
    await db.disconnect();
  }
};

export default handler; 