import db from '../../../utils/db';


const getHandler = async (req, res) => {
    await db.connect();
    const products =  await db.mysql.product.findMany();
    await db.disconnect();
    res.send(products);
  };
export default getHandler;