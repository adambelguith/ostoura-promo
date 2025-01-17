import bcryptjs from 'bcryptjs';
import db from '../../../utils/db';
import nodemailer from 'nodemailer';
import { getRolePermissions } from '../../../utils/permissions';

async function sendMailAsync(transporter, user) {
  try {
    await transporter.sendMail({
      from: '"Oustoura Promo verification👥" <qbsdeveloper8@gmail.com>',
      to: user.email,
      subject: 'Email Verification',
      html: `<h1>Please click on the following link to verify your email: </h1>
        <p> ${process.env.NEXTAUTH_URL}/verify-email/${user.id} </p>`,
    });
    return { message: 'Email sent successfully' };
  } catch (error) {
    throw new Error('Email sending failed');
  }
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, email, password } = req.body;

  // Validation
  // if (
  //   !username ||
  //   !email ||
  //   !email.includes('@') ||
  //   !password ||
  //   password.trim().length < 5
  // ) {
  //   return res.status(422).json({
  //     message: 'Validation error - Please check your inputs',
  //   });
  // }

  await db.connect();

  try {
    // Check if user already exists
    const existingUser = await db.user.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(422).json({ message: 'User already exists!' });
    }

    // Create new user with default role and permissions
    const newUser = await db.user.user.create({
      data: {
        username,
        email,
        password: bcryptjs.hashSync(password),
        role: 'user',
        permissions: getRolePermissions('user')
      }
    });

    // Setup email transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.elasticemail.com",
      port: 587,
      starttls: {
        enable: true
      },
      secureConnection: true,
      auth: {
        user: process.env.EMAIL_USER || "qbsdeveloper8@gmail.com",
        pass: process.env.EMAIL_PASS || "F7F8B91DDEA971E0B059B2F21D115B605E80"
      }
    });

    // Send verification email
    await sendMailAsync(transporter, newUser);

    // Return success response
    res.status(201).json({
      message: 'User created successfully!',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      message: 'Error creating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await db.disconnect();
  }
}

export default handler;
