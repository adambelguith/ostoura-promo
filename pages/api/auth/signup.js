import bcryptjs from 'bcryptjs';
import User from '../../../models/User';
import db from '../../../utils/db';
import nodemailer from 'nodemailer'

async function sendMailAsync(transporter,user) {
  try {
    await transporter.sendMail({
      from: '"QBS Quincaillerie ben saleh👥" <qbsdeveloper8@gmail.com>',
      to: user.email,
      subject: 'Email Verification',
      html: `<h1>Please click on the following link to verify your email: </h1>
        <p> ${process.env.BASE_URL}/verify-email/${user._id} </p>`,
    });
    return { message: 'Email sent successfully' };
  } catch (error) {
    throw new Error('Email sending failed');
  }
}
async function handler(req, res) {
  if (req.method !== 'POST') {
    return;
  }
  const { name, email, password } = req.body;
  if (
    !name ||
    !email ||
    !email.includes('@') ||
    !password ||
    password.trim().length < 5
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
  }
try{
  
  const newUser = new User({
    name,
    email,
    password: bcryptjs.hashSync(password),
    isAdmin: false,
  });


const user = await newUser.save();
  const transporter = nodemailer.createTransport({
    host: "smtp.elasticemail.com",
    port: 587,
    starttls: {
      enable: true
  },
  secureConnection: true,
    auth: {
      user: "qbsdeveloper8@gmail.com",
      pass: "F7F8B91DDEA971E0B059B2F21D115B605E80"
    }
  });



 sendMailAsync(transporter,user);

  await db.disconnect();
  res.status(201).send({
    message: 'Created user!',
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
  });
} catch (error){
  res.status(500).json({ message:error})
}
}

export default handler;
