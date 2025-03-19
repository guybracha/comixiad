const express = require('express');
const router = express.Router();
const Comic = require('../models/Comic');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/auth');

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Upload a new comic
router.post('/upload', upload.array('pages', 10), async (req, res) => {
  try {
      const { title, description, language, genre, author, series } = req.body;
      const pages = req.files.map(file => ({ url: `uploads/${file.filename}` })); // ודא שהשדה url מוגדר כראוי

      const newComic = new Comic({
          title,
          description,
          language,
          genre,
          author,
          series,
          pages
      });

      await newComic.save();

      res.status(201).json({ message: 'Comic uploaded successfully', comic: newComic });
  } catch (error) {
      console.error('Error uploading comic:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;