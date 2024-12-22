const express = require('express');
const multer = require('multer');
const Comic = require('./models/Comic'); // נתיב למודל של הקומיקס
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // וודא שהתיקייה קיימת
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// נתיב להעלאת קומיקס
router.post('/upload', upload.array('pages'), async (req, res) => {
  try {
    const { title, description, genre, language } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const comic = new Comic({
      title,
      description,
      genre,
      language,
      pages: req.files.map((file) => ({
        filename: file.filename,
        path: file.path,
      })),
    });

    await comic.save();

    res.status(201).json({ success: true, comicId: comic._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
