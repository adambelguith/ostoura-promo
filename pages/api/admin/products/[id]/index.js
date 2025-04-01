import { isAuth, hasPermission } from '../../../../../middleware/jwt';
import db from '../../../../../utils/db';
import { Permissions } from '../../../../../utils/permissions';

const handler = async (req, res) => {
  const authResult = await isAuth(req, res);
  if (!authResult) {
    return; // Stop further execution if authentication fails
  }

  // Then check permissions
  const permissionResult = await hasPermission(Permissions.MANAGE_PRODUCTS)(req, res);
  if (!permissionResult) {
    return; // Stop further execution if permission check fails
  }

  if (req.method === 'GET') {
    return getHandler(req, res);
  } else if (req.method === 'PUT') {
    return putHandler(req, res);
  } else if (req.method === 'DELETE') {
    return deleteHandler(req, res);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }

};

const getHandler = async (req, res) => {
  await db.connect();
  try {
    const product = await db.mysql.product.findUnique({
      where: { id: parseInt(req.query.id) },
      include: { category: true }
    });
    
    if (!product) {
      return res.status(404).send({ message: 'Product not found' });
    }
    res.send(product);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error fetching product' });
  } finally {
    await db.disconnect();
  }
};

const putHandler = async (req, res) => {
  await db.connect();
  try {
    const updatedProduct = await db.mysql.product.update({
      where: { id: parseInt(req.query.id) },
      data: {
        name_fr: req.body.name_fr,
        name_ar: req.body.name_ar,
        name_url: req.body.name_url,
        description: req.body.description,
        images: req.body.images,
        categoryId: parseInt(req.body.categoryId),
        price: req.body.price,
        quantity: parseInt(req.body.quantity),
        quantity_endommage: parseInt(req.body.quantity_endommage),
        quantity_notification: parseInt(req.body.quantity_notification)
      }
    });
    res.send({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error updating product' });
  } finally {
    await db.disconnect();
  }
};

const deleteHandler = async (req, res) => {
  await db.connect();
  try {
    await db.mysql.product.delete({
      where: { id: parseInt(req.query.id) }
    });
    res.send({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error deleting product' });
  } finally {
    await db.disconnect();
  }
};

export default handler;
