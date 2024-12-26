const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Comic = require('../models/Comic');

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

// Get all comics
router.get('/', async (req, res) => {
  try {
    const comics = await Comic.find();
    console.log('Fetched comics:', comics);
    res.json(comics);
  } catch (error) {
    console.error('Error fetching comics:', error);
    res.status(500).json({ error: 'Failed to fetch comics' });
  }
});

// Upload new comic
router.post('/upload', upload.array('pages'), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  try {
    const { title, description, genre, language, author } = req.body;
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
    console.log('Saved new comic:', newComic);
    res.status(201).json(newComic);
  } catch (error) {
    console.error('Error uploading comic:', error);
    res.status(500).json({ error: 'Failed to upload comic' });
  }
});

// Get comic by ID
router.get('/:id', async (req, res) => {
  try {
    const comic = await Comic.findById(req.params.id);
    if (!comic) {
      return res.status(404).json({ error: 'Comic not found' });
    }
    res.json(comic);
  } catch (error) {
    console.error('Error fetching comic:', error);
    res.status(500).json({ error: 'Failed to fetch comic' });
  }
});

// Remove static file serving from here - it should be in server.js
module.exports = router;