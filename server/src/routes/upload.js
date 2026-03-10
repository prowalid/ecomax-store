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

const upload = multer({ storage });

// Protected route: Only authenticated admins can upload images
router.use(authMiddleware);

router.post('/', upload.single('file'), uploadController);

module.exports = router;
