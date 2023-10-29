import bcryptjs from 'bcryptjs';
import User from '../../../models/User';
import db from '../../../utils/db';
// import nodemailer from 'nodemailer'

async function handler(req, res) {
  if (req.method !== 'POST') {
    return;
  }
  const { name, email } = req.body;
  if (
    !name ||
    !email
  ) {
    res.status(422).json({
      message: 'Validation error',
    });
    return;
  }

  await db.connect();

  const existingUser = await User.findOne({ email: email });
  if (existingUser) {
    res.status(422).json({ message: 'User exists already!' });
    await db.disconnect();
    return;
  }else{
    const newUser = new User({
        name,
        email,
        isAdmin: false,
        isActivated: true
      });
      const user = await newUser.save();
      await db.disconnect();
      res.status(201).send({
        message: 'Created user!',
        name: user.name,
      });
  }
}

export default handler;
