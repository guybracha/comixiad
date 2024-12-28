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
router.get('/:id', async (req, res) => {
  try {
      const comic = await Comic.findById(req.params.id)
          .populate('author', 'username')
          .lean();
      
      if (!comic) {
          return res.status(404).json({ error: 'Comic not found' });
      }

      res.json(comic);
  } catch (error) {
      console.error('Error fetching comic:', error);
      res.status(500).json({ error: 'Error fetching comic' });
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

router.post('/:id/like', async (req, res) => {
  try {
      const comic = await Comic.findById(req.params.id);
      if (!comic) {
          return res.status(404).json({ error: 'Comic not found' });
      }

      const userId = req.body.userId;
      const likeIndex = comic.likes.indexOf(userId);

      if (likeIndex === -1) {
          comic.likes.push(userId);
      } else {
          comic.likes.splice(likeIndex, 1);
      }

      await comic.save();
      res.json(comic);
  } catch (err) {
      console.error('Like error:', err);
      res.status(500).json({ error: 'Failed to update likes' });
  }
});

router.post('/:id/view', async (req, res) => {
  try {
      const comic = await Comic.findByIdAndUpdate(
          req.params.id,
          { $inc: { views: 1 } },
          { new: true }
      );
      
      if (!comic) {
          return res.status(404).json({ error: 'Comic not found' });
      }

      res.json(comic);
  } catch (error) {
      console.error('Error updating views:', error);
      res.status(500).json({ error: 'Error updating views' });
  }
});


// Remove static file serving from here - it should be in server.js
module.exports = router;