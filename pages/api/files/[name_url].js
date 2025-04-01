import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { name_url } = req.query;

  if (!name_url || typeof name_url !== 'string') {
    return res.status(400).json({ error: 'Invalid name_url' });
  }

  const folderPath = path.join(process.cwd(), 'uploads', name_url);

  // Check if the folder exists
  if (!fs.existsSync(folderPath)) {
    return res.status(404).json({ error: 'Folder not found' });
  }

  try {
    // Read all files in the folder
    const files = fs.readdirSync(folderPath);

    // Filter for supported image files and generate URLs
    const images = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
      })
      .map((file) => ({
        name: file,
        url: `/api/files/${name_url}/${file}`, // API route to serve the file
      }));

    res.status(200).json({ images });
  } catch (error) {
    console.error('Error reading files:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
