const uploadController = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // req.file is provided by multer and has filename, path, etc.
    const fileUrl = `/uploads/${req.file.filename}`;
    
    // We return the relative URL to the static folder.
    res.json({ url: fileUrl });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Internal server error during upload' });
  }
};

module.exports = { uploadController };
