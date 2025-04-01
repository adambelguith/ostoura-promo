import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { productId, filename } = req.query;

  if (!productId || !filename) {
    return res.status(400).json({ message: 'Missing productId or filename' });
  }

  const filePath = path.join(process.cwd(), 'uploads', 'products', productId, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  // Stream the file to the client
  const fileStream = fs.createReadStream(filePath);
  res.setHeader('Content-Type', 'image/jpeg'); // Adjust MIME type as needed
  fileStream.pipe(res);
} 