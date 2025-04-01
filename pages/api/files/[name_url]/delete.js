import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name_url, filename } = req.body;

    if (!name_url || !filename) {
      return res.status(400).json({ error: 'Invalid request. Missing parameters.' });
    }

    const filePath = path.join(process.cwd(), 'uploads', name_url, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete the file
    fs.unlinkSync(filePath);

    return res.status(200).json({ message: 'File deleted successfully.' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
