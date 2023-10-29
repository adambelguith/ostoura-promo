import { getSession } from 'next-auth/react';
import {Subcategory} from  '../../../../models/Product';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  const session = await getSession({ req });
  if (!session || !session.user.isAdmin) {
    return res.status(401).send('admin signin required');
  }
  if (req.method === 'GET') {
    return getHandler(req, res);
  }
   else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
  
};
 
const getHandler = async (req , res) => {
  await db.connect();
    const category = await Subcategory.find({category: req.query.category});
    res.status(200).send(category);
  await db.disconnect();
  
}

export default handler;