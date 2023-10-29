import {Subcategory} from '../../../../models/Product';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  await db.connect();
  const subcategory = await Subcategory.findById(req.query.id);
  await db.disconnect();
  const name =subcategory.name
  const category =subcategory.category
  res.send({name,category});
};

export default handler;