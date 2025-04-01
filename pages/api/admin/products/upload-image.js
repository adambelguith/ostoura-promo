import fs from 'fs';
import path from 'path';
import multer from 'multer';

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { productId } = req.query; // Get product ID from query params
    const uploadDir = path.join(process.cwd(), 'uploads', 'products', productId);

    // Create the directory if it doesn't exist
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

// Initialize multer
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Middleware to handle file upload
const uploadMiddleware = upload.single('file');

export const config = {
  api: {
    bodyParser: false, // Disable default bodyParser to handle multipart/form-data
  },
};

export default function handler(req, res) {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Return the file path relative to the uploads directory
    const filePath = `/api/admin/products/serve-image?productId=${req.query.productId}&filename=${req.file.filename}`;
    res.status(200).json({ filePath });
  });
} 