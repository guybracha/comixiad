const express = require('express');
const router = express.Router();
const Series = require('../models/Series');
const Comic = require('../models/Comic');
const multer = require('multer');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// יצירת סדרה חדשה
router.post('/', auth, upload.single('coverImage'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const coverImage = req.file ? req.file.filename : null;
    if (!name || !description) return res.status(400).json({ message: 'Missing required fields' });

    const newSeries = new Series({
      name,
      description,
      coverImage,
      author: req.userId
    });

    const savedSeries = await newSeries.save();
    res.status(201).json(savedSeries);
  } catch (err) {
    console.error('Error creating series:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// שליפת קומיקסים לפי מזהה סדרה
router.get('/:seriesId/comics', async (req, res) => {
  try {
    const comics = await Comic.find({ series: req.params.seriesId });
    res.json(comics);
  } catch (error) {
    console.error('Error fetching comics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// שליפת כל הסדרות (אופציונלי: סינון לפי author)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.author) filter.author = req.query.author;
    const series = await Series.find(filter).sort({ createdAt: -1 });
    res.json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// שליפת סדרה לפי מזהה
router.get('/:id', async (req, res) => {
  try {
    const series = await Series.findById(req.params.id);
    if (!series) return res.status(404).json({ message: 'Series not found' });
    res.json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// עדכון סדרה
router.put('/:id', auth, upload.single('coverImage'), async (req, res) => {
  try {
    const series = await Series.findById(req.params.id);
    if (!series) return res.status(404).json({ message: 'Series not found' });

    if (series.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    series.name = req.body.name || series.name;
    series.description = req.body.description || series.description;
    if (req.file) series.coverImage = req.file.filename;

    await series.save();
    res.json(series);
  } catch (err) {
    console.error('Error updating series:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// מחיקת סדרה
router.delete('/:id', auth, async (req, res) => {
  try {
    const series = await Series.findById(req.params.id);
    if (!series) return res.status(404).json({ message: 'Series not found' });

    if (series.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Series.findByIdAndDelete(req.params.id);
    res.json({ message: 'Series deleted successfully' });
  } catch (error) {
    console.error('Error deleting series:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;