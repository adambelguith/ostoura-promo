import db from '../../../utils/db';
import { getRolePermissions } from '../../../utils/permissions';
import bcryptjs from 'bcryptjs';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, email } = req.body;

  // Validation
  if (!username || !email || !email.includes('@')) {
    return res.status(422).json({
      message: 'Validation error - Invalid input',
    });
  }

  await db.connect();

  try {
    // Check if user exists
    const existingUser = await db.user.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(422).json({ 
        message: 'User exists already!',
        user: {
          id: existingUser.id,
          username: existingUser.username,
          email: existingUser.email,
          role: existingUser.role
        }
      });
    }

    // Create new user with Google signup
    const newUser = await db.user.user.create({
      data: {
        username,
        email,
        // Generate a random password for Google users
        password: bcryptjs.hashSync(Math.random().toString(36), 10),
        role: 'user', // Default role for Google signup
        permissions: getRolePermissions('user'), // Get default user permissions
        created_at: new Date()
      }
    });

    // Return success response
    res.status(201).json({
      message: 'Created user!',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Google signup error:', error);
    res.status(500).json({ 
      message: 'Error creating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await db.disconnect();
  }
}

export default handler;
