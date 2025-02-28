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
router.post('/upload', verifyToken, upload.array('pages'), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  try {
    const { title, description, genre, language } = req.body;
    const author = req.user.id; // User ID from token

    if (!title || !description || !genre || !language) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const pages = req.files.map(file => ({
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
    }));

    const newComic = new Comic({
      title,
      description,
      genre,
      language,
      author,
      pages,
    });

    await newComic.save();
    res.status(201).json(newComic);
  } catch (error) {
    console.error('Error uploading comic:', error);
    // Remove uploaded files if saving to DB fails
    req.files.forEach(file => {
      fs.unlink(path.join(__dirname, '../uploads', file.filename), err => {
        if (err) console.error('Error deleting file:', err);
      });
    });
    res.status(500).json({ error: 'Failed to upload comic' });
  }
});

module.exports = router;