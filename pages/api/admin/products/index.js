import { getSession } from 'next-auth/react';
import {Product, Category,Subcategory} from '../../../../models/Product';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  const session = await getSession({ req });
  if (!session || !session.user.isAdmin) {
    return res.status(401).send('admin signin required');
  }
  // const { user } = session;
  if (req.method === 'GET') {
    return getHandler(req, res);
  } else if (req.method === 'POST') {
    return postHandler(req, res);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
};
const postHandler = async (req, res) => {
  await db.connect();
  let newCategory = await Category.findOne({name: req.body.category });

  if(!newCategory){
     const newproductCategory = new Category({
    name: req.body.category,
  });
   await newproductCategory.save();
   newCategory= newproductCategory;
  }

  let newSubcategory= await Subcategory.findOne({name : req.body.subcategory});
  if(!newSubcategory){
    const newproductSubcategory = new Subcategory({
    name: req.body.subcategory,
    category : req.body.category
  });
  await newproductSubcategory.save();
  newSubcategory = newproductSubcategory;
  }


  const newProduct = new Product({
    name: req.body.name,
    slug: req.body.slug + Math.random(),
    image: req.body.image,
    video:req.body.video,
    price:req.body.price,
    promotion : req.body.promotion ? req.body.promotion : null,
    category: req.body.category,
    subcategory:req.body.subcategory,
    brand: req.body.brand,
    countInStock: req.body.countInStock,
    description: req.body.description,
    rating: 0,
    numReviews: 0,
    sell: 0,
  });

  const product = await newProduct.save();
  await db.disconnect();
  res.send({ message: 'Product created successfully', product });
};
const getHandler = async (req, res) => {
  await db.connect();
  const products = await Product.find({});
  await db.disconnect();
  res.send(products);
};
export default handler;
