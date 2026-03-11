const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadController } = require('../controllers/uploadController');
const authMiddleware = require('../middleware/auth');

// Setup multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const ALLOWED_TYPES = /jpeg|jpg|png|gif|webp|svg\+xml/;

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const extOk = /\.(jpe?g|png|gif|webp|svg)$/i.test(file.originalname);
    const mimeOk = ALLOWED_TYPES.test(file.mimetype);
    if (extOk && mimeOk) return cb(null, true);
    cb(new Error('Only image files (jpg, png, gif, webp, svg) are allowed'));
  },
});

// Protected route: Only authenticated admins can upload images
router.use(authMiddleware);

router.post('/', upload.single('file'), uploadController);

module.exports = router;
