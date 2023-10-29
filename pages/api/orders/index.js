import { getSession } from 'next-auth/react';
import Order from '../../../models/Order';
import {Product } from '../../../models/Product'
import User from '../../../models/User'
import db from '../../../utils/db';

const handler = async (req, res) => {
  const session = await getSession({ req });
  let users 
  if (session) {
    const { user } = session;
    await db.connect();
    users =  await User.findOne({ email: user.email });
  }
  
  const newOrder = new Order({
    ...req.body,
    user: users ? users._id : null,
  });
 if(newOrder){
  req.body.orderItems.map(async (item) => {
    const product = await Product.findById(item._id);
    if (product) {
      product.sell += item.quantity;
      product.countInStock -= item.quantity;
      await product.save();
    }
    return product; } )
 }
  const order = await newOrder.save();
  res.status(201).send(order);
};
export default handler;
