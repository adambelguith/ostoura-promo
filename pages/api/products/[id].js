import db from '../../../utils/db';

const handler = async (req, res) => {
  await db.connect();
  try {
    const product = await db.mysql.product.findUnique({
      where: { id: parseInt(req.query.id) },
      include: {
        category: true // Include the related category data
      }
    });
    
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
    } else {
      res.status(200).json(product);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error fetching product' });
  } finally {
    await db.disconnect();
  }
};

export default handler;
