const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { uploadController } = require('../controllers/UploadController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function resolveFileStorage(req) {
  const container = req.app?.locals?.container;
  if (!container) {
    throw new Error('Container is not available for upload storage');
  }

  return container.resolve('fileStorage');
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    try {
      const fileStorage = resolveFileStorage(req);
      const uploadsDir = fileStorage.getUploadsDir();
      fs.mkdir(uploadsDir, { recursive: true }, (err) => cb(err, uploadsDir));
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    try {
      const fileStorage = resolveFileStorage(req);
      cb(null, fileStorage.generateStoredFilename(file.originalname));
    } catch (error) {
      cb(error);
    }
  },
});

const ALLOWED_TYPES = /jpeg|jpg|png|gif|webp/;

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const extOk = /\.(jpe?g|png|gif|webp)$/i.test(file.originalname);
    const mimeOk = ALLOWED_TYPES.test(file.mimetype);
    if (extOk && mimeOk) {
      return cb(null, true);
    }

    cb(new Error('Only image files (jpg, png, gif, webp) are allowed'));
  },
});

router.use(authMiddleware);
router.post('/', upload.single('file'), uploadController);

module.exports = router;
