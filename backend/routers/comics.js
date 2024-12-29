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

router.put('/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const { userId, title, description } = req.body;

      const comic = await Comic.findOneAndUpdate(
          { _id: id, author: userId },
          { title, description },
          { new: true }
      );

      if (!comic) {
          return res.status(404).json({ message: 'Comic not found or you are not the author' });
      }

      res.json(comic);
  } catch (err) {
      console.error('Error updating comic:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete comic
router.delete('/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const { userId } = req.body;

      const comic = await Comic.findOneAndDelete({ _id: id, author: userId });
      
      if (!comic) {
          return res.status(404).json({ message: 'Comic not found or you are not the author' });
      }

      res.json({ message: 'Comic deleted successfully' });
  } catch (err) {
      console.error('Error deleting comic:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
  }
});

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

router.get('/user/:userId', async (req, res) => {
  try {
      const { userId } = req.params;
      const comics = await Comic.find({ author: userId });

      if (!comics) {
          return res.status(404).json({ message: 'No comics found for this user' });
      }

      res.json(comics);
  } catch (err) {
      console.error('Error fetching comics:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
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