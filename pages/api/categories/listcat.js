import {Category} from '../../../models/Product';
import db from '../../../utils/db';
 
const getHandler = async (req , res) => {
  await db.connect();
  const category = await Category.find({}).sort({ createdAt: -1}).limit(20);
  await db.disconnect();
  res.send(category);
}

export default getHandler;