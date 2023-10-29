import {Product} from '../../../models/Product';
import db from '../../../utils/db';


const getHandler = async (req, res) => {
    await db.connect();
    const products =  await Product.find({ isFeatured: true }).lean();
    await db.disconnect();
    res.send(products);
  };
export default getHandler;