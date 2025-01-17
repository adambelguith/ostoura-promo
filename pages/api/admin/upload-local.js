import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const form = new formidable.IncomingForm({
        maxFileSize: 10 * 1024 * 1024, // 10MB
      });

      const { fields, files } = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve({ fields, files });
        });
      });

      const file = files.file[0];
      const productId = fields.productId[0];
      
      // Create directories if they don't exist
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products', productId);
      const thumbnailDir = path.join(uploadDir, 'thumbnails');
      
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.mkdir(thumbnailDir, { recursive: true });

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.originalFilename}`;
      
      // Save original file
      const originalPath = path.join(uploadDir, fileName);
      await fs.copyFile(file.filepath, originalPath);

      let response = {
        url: `/uploads/products/${productId}/${fileName}`,
      };

      // Generate thumbnail for images
      if (file.mimetype.startsWith('image/')) {
        const thumbnailName = `thumb-${fileName}`;
        const thumbnailPath = path.join(thumbnailDir, thumbnailName);
        
        await sharp(file.filepath)
          .resize(300, 300, { fit: 'cover' })
          .jpeg({ quality: 80 })
          .toFile(thumbnailPath);

        response.thumbnail = `/uploads/products/${productId}/thumbnails/${thumbnailName}`;
      }

      // Clean up temp file
      await fs.unlink(file.filepath);

      res.status(200).json(response);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Failed to upload file' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { urls, productId } = req.body;
      
      const deletePromises = urls.map(async (url) => {
        const filePath = path.join(process.cwd(), 'public', url);
        await fs.unlink(filePath);
      });

      await Promise.all(deletePromises);
      res.status(200).json({ message: 'Files deleted successfully' });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ message: 'Failed to delete files' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}