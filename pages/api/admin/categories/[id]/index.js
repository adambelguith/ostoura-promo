import { getSession } from 'next-auth/react';
import {Subcategory} from '../../../../../models/Product';
import db from '../../../../../utils/db';

const handler = async (req, res) => {
  const session = await getSession({ req });
  if (!session || (session && !session.user.isAdmin)) {
    return res.status(401).send('signin required');
  }

  const { user } = session;
  if (req.method === 'GET') {
    return getHandler(req, res, user);
  } else if (req.method === 'PUT') {
    return putHandler(req, res, user);
  } else if (req.method === 'DELETE') {
    return deleteHandler(req, res, user);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
};
const getHandler = async (req, res) => {
  await db.connect();
  const subcategory = await Subcategory.findById(req.query.id);
  await db.disconnect();
  res.send(subcategory);
};
const putHandler = async (req, res) => {
  await db.connect();
  const subcategory = await Subcategory.findById(req.query.id);
  if (subcategory) {
    subcategory.name =  req.body.subcategory;
    subcategory.category =  req.body.category;
    await subcategory.save();
    await db.disconnect();
    res.send({ message: 'Category updated successfully' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Category not found' });
  }
};
const deleteHandler = async (req, res) => {
  await db.connect();
  const subcategory = await Subcategory.findById(req.query.id);
  if (subcategory) {
    await subcategory.remove();
    await db.disconnect();
    res.send({ message: 'category deleted successfully' });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'category not found' });
  }
};
export default handler;
