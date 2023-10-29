import { getSession } from 'next-auth/react';
import bcryptjs from 'bcryptjs';
import User from '../../../models/User';
import db from '../../../utils/db';

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(400).send({ message: `${req.method} not supported` });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).send({ message: 'signin required' });
  }

  const { user } = session;
  const { name, email,prevpassword, password } = req.body;
  if (
    !name ||
    !email ||
    !email.includes('@')||
    (prevpassword && prevpassword.trim().length < 5) ||
    (password && password.trim().length < 5)
  ) {
    res.status(422).json({
      message: 'Validation error',
    });
    return;
  }
 
  await db.connect();
  const toUpdateUser = await User.findById(user._id);
  if (!toUpdateUser) {
    res.status(404).json({
      message: 'User not found',
    });
    return;
  }

  const isPrevPasswordValid = bcryptjs.compareSync(prevpassword, toUpdateUser.password);
  if (!isPrevPasswordValid) {
    res.status(403).json({
      message: 'Previous password is incorrect',
    });
    return;
  }

  toUpdateUser.name = name;
  toUpdateUser.email = email;

  if (password) {
    toUpdateUser.password = bcryptjs.hashSync(password);
  }

  await toUpdateUser.save();
  await db.disconnect();
  res.send({
    message: 'User updated',
  });
}

export default handler;
