import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { tempProductId, productId } = req.body;

  if (!tempProductId || !productId) {
    return res.status(400).json({ message: 'Missing tempProductId or productId' });
  }

  const tempDir = path.join(process.cwd(), 'uploads', 'products', tempProductId);
  const productDir = path.join(process.cwd(), 'uploads', 'products', productId);

  if (!fs.existsSync(tempDir)) {
    return res.status(404).json({ message: 'Temporary directory not found' });
  }

  // Create the product directory if it doesn't exist
  if (!fs.existsSync(productDir)) {
    fs.mkdirSync(productDir, { recursive: true });
  }

  // Move files from temp directory to product directory
  fs.readdirSync(tempDir).forEach((file) => {
    const oldPath = path.join(tempDir, file);
    const newPath = path.join(productDir, file);
    fs.renameSync(oldPath, newPath);
  });

  // Remove the temporary directory
  fs.rmdirSync(tempDir);

  res.status(200).json({ message: 'Image paths updated successfully' });
} 