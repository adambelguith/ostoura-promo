import { getSession } from 'next-auth/react';
import cloudinary from './cloudinary_config'
const handler = async (req, res) => {
    const session = await getSession({ req });
    if (!session || !session.user.isAdmin) {
      return res.status(401).send('admin signin required');
    }
    try {
        const { public_id } = req.body; 
    
        if (!public_id) {
          return res.status(400).json({ error: 'Missing public_id' });
        }

        const result = await cloudinary.uploader.destroy(public_id);
    
        if (result.result === 'ok') {
          return res.status(200).json({ message: 'Element deleted successfully' });
        } else {
          return res.status(500).json({ error: 'Failed to delete element' });
        }
      } catch (error) {
        console.error('Error deleting element:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

}
export default handler;