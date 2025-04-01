import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadFolder = path.join(process.cwd(), 'upload');

// Ensure the directory exists
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing
  },
};

export default function handler(req, res) {
  if (req.method === 'POST') {
    upload.single('file')(req, res, (err) => {
      if (err) {
        return res.status(500).json({ message: 'File upload failed' });
      }

      const filePath = path.join('upload', req.file.filename); // Store path relative to your server
      return res.status(200).json({ filePath });
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
