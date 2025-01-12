const express = require('express');
const router = express.Router();
const Comic = require('../models/Comic');
const multer = require('multer');
const path = require('path');

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

// Validation middleware
const validateComicInput = (req, res, next) => {
  const { title, description, author, genre, language } = req.body;
  if (!title || !description || !author || !genre || !language) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  next();
};

// Get all comics
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all comics...');
    const comics = await Comic.find().populate('author', 'username').sort({ createdAt: -1 });
    console.log(`Found ${comics.length} comics`);
    res.json(comics);
  } catch (error) {
    console.error('Error fetching comics:', error);
    res.status(500).json({ message: 'Error fetching comics', error: error.message });
  }
});

// Get comic by ID
router.get('/:id', async (req, res) => {
  try {
    const comic = await Comic.findById(req.params.id).populate('author', 'username');
    if (!comic) {
      return res.status(404).json({ error: 'Comic not found' });
    }
    res.json(comic);
  } catch (error) {
    console.error('Error fetching comic:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

router.get('/series/:seriesId', async (req, res) => {
  try {
      const comics = await Comic.find({ series: req.params.seriesId });
      res.json(comics);
  } catch (err) {
      console.error('Error fetching comics:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
  }
});

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

// הגדלת מספר הלייקים
router.put('/:id/like', verifyToken, async (req, res) => {
  const userId = req.user.id; // זיהוי המשתמש מה-Token
  const comicId = req.params.id;

  try {
      const comic = await Comic.findById(comicId);
      if (!comic) return res.status(404).json({ message: 'Comic not found' });

      // בדיקה אם המשתמש כבר נתן לייק
      if (comic.likedBy.includes(userId)) {
          return res.status(400).json({ message: 'User has already liked this comic' });
      }

      // עדכון הלייקים ורשימת המשתמשים
      comic.likes += 1;
      comic.likedBy.push(userId);
      await comic.save();

      res.json({ likes: comic.likes });
  } catch (err) {
      console.error('Failed to update likes:', err);
      res.status(500).json({ message: 'Failed to update likes' });
  }
});


module.exports = router;