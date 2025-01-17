import { isAuth, isAdmin } from '../../../../middleware/jwt';
import { ACTIONS } from '../../../../utils/permissions';
import checkPermission from '../../../../middleware/checkPermission';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  // First check authentication
  await isAuth(req, res, async () => {
    if (req.method === 'GET') {
      return getHandler(req, res);
    } else if (req.method === 'POST') {
      // Then check admin role and specific permission
      await isAdmin(req, res, () => 
        checkPermission(ACTIONS.CREATE_PRODUCT)(req, res, () => postHandler(req, res))
      );
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  });
};

const getHandler = async (req, res) => {
  await db.connect();
  try {
    const products = await db.mysql.product.findMany();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  } finally {
    await db.disconnect();
  }
};

const postHandler = async (req, res) => {
  await db.connect();
  try {
    const product = await db.mysql.product.create({
      data: {
        ...req.body,
        userId: req.user.id // Access the authenticated user's ID
      }
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product' });
  } finally {
    await db.disconnect();
  }
};

export default handler;
