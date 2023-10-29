import db from "../../../../utils/db";
import User from "../../../../models/User";


export default async function handler(req, res) {
    if (req.method === 'GET') {
      const userId = req.query.id;
  
      await db.connect();
  
      const user = await User.findById(userId);
  
      if (user) {
        user.isEmailVerified = true;
        await user.save();
        res.status(200).send('Email verified successfully');
      } else {
        res.status(404).send('User not found');
      }
  
      await db.disconnect();
    } else {
      res.status(405).end();
    }
  }