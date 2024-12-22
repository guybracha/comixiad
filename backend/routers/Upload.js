const express = require('express');
const multer = require('multer');
const { upload } = require('../config/db');  // Use GridFS storage from the db config
const Comic = require('../models/Comic');
const router = express.Router();
const GridFsStorage = require('multer-gridfs-storage');

// Upload multiple files
router.post('/', upload.array('comicPages', 10), async (req, res) => {
  try {
    const pageUrls = req.files.map(file => `/uploads/${file.filename}`);  // Adjust URL for retrieval

    const { title, description, genre, language } = req.body;

    const newComic = new Comic({
      title,
      description,
      genre,
      language,
      pages: pageUrls,
    });

    await newComic.save();
    res.status(200).json({ message: 'Comic uploaded successfully!', comic: newComic });
  } catch (err) {
    console.error('Error uploading comic:', err);
    res.status(500).json({ message: 'Failed to upload comic' });
  }
});

module.exports = router;
