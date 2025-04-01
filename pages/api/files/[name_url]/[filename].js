import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { name_url, filename } = req.query;

  const filePath = path.join(process.cwd(), 'uploads', name_url, filename);

  if (fs.existsSync(filePath)) {
    const fileExtension = path.extname(filename).toLowerCase();
    const mimeTypeMap = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
    };

    const mimeType = mimeTypeMap[fileExtension] || 'application/octet-stream';

    res.setHeader('Content-Type', mimeType);
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
}
