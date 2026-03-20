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

const ALLOWED_TYPES = /jpeg|jpg|png|gif|webp|svg\+xml|avif/;
const ALLOWED_EXTENSIONS = /\.(jpe?g|png|gif|webp|svg|avif)$/i;
const INVALID_FILE_TYPE_MESSAGE = 'صيغة الصورة غير مدعومة. استخدم jpg أو png أو gif أو webp أو svg أو avif.';
const FILE_TOO_LARGE_MESSAGE = 'حجم الصورة يجب ألا يتجاوز 5 ميغابايت.';

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const extOk = ALLOWED_EXTENSIONS.test(file.originalname);
    const mimeOk = ALLOWED_TYPES.test(file.mimetype);
    if (extOk && mimeOk) {
      return cb(null, true);
    }

    const error = new Error(INVALID_FILE_TYPE_MESSAGE);
    error.status = 400;
    cb(error);
  },
});

router.use(authMiddleware);
router.post('/', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (!err) {
      return uploadController(req, res, next);
    }

    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      err.status = 400;
      err.message = FILE_TOO_LARGE_MESSAGE;
      return next(err);
    }

    if (!err.status) {
      err.status = 400;
    }

    if (err.message === 'Only image files (jpg, png, gif, webp) are allowed') {
      err.message = INVALID_FILE_TYPE_MESSAGE;
    }

    return next(err);
  });
});

module.exports = router;
