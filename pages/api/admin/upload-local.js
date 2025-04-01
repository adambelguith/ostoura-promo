import fs from 'fs';
import path from 'path';
import multer from 'multer';

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { name_url } = req.query; // Get name_url from query parameters

    // Validate name_url
    if (!name_url || typeof name_url !== 'string') {
      return cb(new Error('Invalid name_url'));
    }

    const uploadDir = path.join(process.cwd(), 'uploads', name_url);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false, // Disable default bodyParser to handle multipart/form-data
  },
};

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Handle GET request to fetch uploaded images
    try {
      const { name_url } = req.query;

      // Validate name_url
      if (!name_url || typeof name_url !== 'string') {
        return res.status(400).json({ message: 'Invalid name_url' });
      }

      const uploadDir = path.join(process.cwd(), 'uploads', name_url);

      // Check if directory exists
      if (!fs.existsSync(uploadDir)) {
        return res.status(200).json({ images: [] });
      }

      // Read files from the directory
      const files = fs.readdirSync(uploadDir);

      // Filter and map files to return their URLs
      const images = files
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
        })
        .map(file => ({
          original: `/uploads/${name_url}/${file}`,
          thumbnail: `/uploads/${name_url}/${file}`,
          name: file,
          type: 'image',
          size: fs.statSync(path.join(uploadDir, file)).size
        }));

      res.status(200).json({ images });
    } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    // Handle POST request for file upload
    try {
      upload.single('file')(req, res, (err) => {
        if (err) {
          console.error('Upload error:', err);
          return res.status(400).json({ message: err.message || 'Upload failed' });
        }

        if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded' });
        }

        // Validate name_url
        const { name_url } = req.query;
        if (!name_url || typeof name_url !== 'string') {
          return res.status(400).json({ message: 'Invalid name_url' });
        }

        // Return the file path
        const filePath = `/uploads/${name_url}/${req.file.filename}`;
        res.status(200).json({ url: filePath });
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method == 'DELETE') {
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
  }   
  else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}