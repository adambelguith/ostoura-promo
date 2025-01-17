import { isAuth, isAdmin } from '../../../../middleware/jwt';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  await isAuth(req, res, async () => {
    await isAdmin(req, res, async () => {
      if (req.method === 'PUT') {
        return approveHandler(req, res);
      }
      return res.status(405).json({ message: 'Method not allowed' });
    });
  });
};

const approveHandler = async (req, res) => {
  const { productId, status, message } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  await db.connect();
  try {
    const product = await db.mysql.product.update({
      where: { id: parseInt(productId) },
      data: {
        status,
        adminId: req.user.id,
        adminMessage: message
      }
    });

    // Notify seller about the decision (implement email notification)

    res.status(200).json({
      message: `Product ${status}`,
      product
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error updating product status' });
  } finally {
    await db.disconnect();
  }
};

export default handler; 