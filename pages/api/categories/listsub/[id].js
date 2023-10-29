import {Subcategory} from '../../../../models/Product';
import db from '../../../../utils/db';

 
const getHandler = async (req , res) => {
  await db.connect();
  const category = await Subcategory.find({category: req.query.id});
  await db.disconnect();
  res.send(category);
}

export default getHandler;