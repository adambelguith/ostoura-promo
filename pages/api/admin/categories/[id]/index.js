import db from '../../../../../utils/db';
import { isAuth, hasPermission } from '../../../../../middleware/jwt';
import { Permissions } from '../../../../../utils/permissions';

const handler = async (req, res) => {

  await hasPermission(Permissions.MANAGE_CATEGORIES)(req, res, () => {});
  await isAuth(req, res, async () => {
  if (req.method === 'GET') {
    return getHandler(req, res);
  } else if (req.method === 'PUT') {
    return putHandler(req, res);
  } else if (req.method === 'DELETE') {
    return deleteHandler(req, res);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
  });
};

const getHandler = async (req, res) => {
  await db.connect();
  const category = await db.mysql.category.findUnique({
    where: { id: Number(req.query.id) },
  });
  await db.disconnect();
  if (category) {
    res.send(category);
  } else {
    res.status(404).send({ message: 'Category not found' });
  }
};

const putHandler = async (req, res) => {
  await db.connect();
  const category = await db.mysql.category.findUnique({
    where: { id: Number(req.query.id) },
  });
  if (category) {
    const updatedCategory = await db.mysql.category.update({
      where: { id: Number(req.query.id) },
      data: {
        name_fr: req.body.name_fr,
        name_ar: req.body.name_ar,
        description_fr: req.body.description_fr,
        description_ar: req.body.description_ar,
        id_fathercategory: req.body.id_fathercategory,
      },
    });
    await db.disconnect();
    res.send({ message: 'Category updated successfully', category: updatedCategory });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Category not found' });
  }
};

const deleteHandler = async (req, res) => {
  await db.connect();
  const category = await db.mysql.category.findUnique({
    where: { id: Number(req.query.id) },
  });
  if (category) {
    await db.mysql.category.delete({
      where: { id: Number(req.query.id) },
    });
    await db.disconnect();
    res.send({ message: 'Category deleted successfully' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Category not found' });
  }
};

export default handler;
