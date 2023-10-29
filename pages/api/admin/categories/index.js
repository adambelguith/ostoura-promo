import { getSession } from 'next-auth/react';
import {Category , Subcategory} from '../../../../models/Product';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  const session = await getSession({ req });
  if (!session || !session.user.isAdmin) {
    return res.status(401).send('admin signin required');
  }
  if (req.method === 'GET') {
    return getHandler(req, res);
  } else if (req.method === 'POST') {
    return postHandler(req, res);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
  
};
const postHandler = async (req, res) =>{
    db.connect();
    const newCategory = await Category.findOne({name: req.body.category });
  if(!newCategory){
     const newproductCategory = new Category({
    name: req.body.category,
  });
  await newproductCategory.save();
 }
 const newSubcategory= await Subcategory.findOne({name : req.body.subcategory});
 if(!newSubcategory){
   const newproductSubcategory = new Subcategory({
   name: req.body.subcategory,
   category : req.body.category
 });
 await newproductSubcategory.save();
}
 await db.disconnect();
  res.send({ message: 'category created successfully'});


}
 
const getHandler = async (req , res) => {
  await db.connect();
  const subcategory = await Subcategory.find({});
  await db.disconnect();
  res.send(subcategory);
}

export default handler;