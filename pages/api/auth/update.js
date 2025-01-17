import { getSession } from 'next-auth/react';
import bcryptjs from 'bcryptjs';
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
  const { username, email, prevpassword, password } = req.body;

  if (
    !username ||
    !email ||
    !email.includes('@') ||
    (prevpassword && prevpassword.trim().length < 5) ||
    (password && password.trim().length < 5)
  ) {
    res.status(422).json({
      message: 'Validation error',
    });
    return;
  }

  await db.connect();
  try {
    // Find user using Prisma
    const toUpdateUser = await db.user.user.findUnique({
      where: {
        id: parseInt(user.id)
      }
    });

    if (!toUpdateUser) {
      res.status(404).json({
        message: 'User not found',
      });
      return;
    }

    // Verify previous password
    const isPrevPasswordValid = bcryptjs.compareSync(prevpassword, toUpdateUser.password);
    if (!isPrevPasswordValid) {
      res.status(403).json({
        message: 'Previous password is incorrect',
      });
      return;
    }

    // Update user with Prisma
    const updatedUser = await db.user.user.update({
      where: {
        id: parseInt(user.id)
      },
      data: {
        username,
        email,
        ...(password && { password: bcryptjs.hashSync(password) })
      }
    });

    res.send({
      message: 'User updated',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  } finally {
    await db.disconnect();
  }
}

export default handler;
