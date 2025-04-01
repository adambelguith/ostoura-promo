import { getSession } from 'next-auth/react';
import db from '../../../../utils/db';

const handler = async (req, res) => {
  const session = await getSession({ req });
  if (!session || !session.user.permissions.includes('manage_users')) {
    return res.status(403).send('You do not have permission to manage users');
  }

  if (req.method === 'GET') {
    return getHandler(req, res);
  } else {
    return res.status(400).send({ message: 'Method not allowed' });
  }
};

const getHandler = async (req, res) => {
  await db.connect();
  const users = await db.user.user.findMany(); // Adjust based on your user model
  await db.disconnect();
  res.send(users);
};

export default handler;
