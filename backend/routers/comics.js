const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Comic = require('../models/Comic');

// Setup multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    const comics = await Comic.find();
    console.log('Found comics:', comics); // Debug log
    res.json(comics);
  } catch (error) {
    console.error('Error fetching comics:', error);
    res.status(500).send('Failed to fetch comics');
  }
});

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

router.post('/upload', upload.array('pages'), async (req, res) => {
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
    res.status(201).send(newComic);
  } catch (error) {
    console.error('Error uploading comic:', error);
    res.status(500).send('Failed to upload comic.');
  }
});

// Don't serve static files here - move to server.js
module.exports = router;