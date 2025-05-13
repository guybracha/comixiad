const express = require('express');
const router = express.Router();
const Series = require('../models/Series');
const Comic = require('../models/Comic');
const multer = require('multer');
const verifyToken = require('../middleware/auth'); // Ensure verifyToken is imported correctly

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Create a new series

router.post('/', verifyToken, upload.single('coverImage'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const coverImage = req.file ? req.file.filename : null;

    if (!name || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newSeries = new Series({
      name,
      description,
      coverImage,
      author: req.user.userId // ⬅️ מתוך הטוקן
    });

    const savedSeries = await newSeries.save();
    res.status(201).json(savedSeries);
  } catch (err) {
    console.error('Error creating series:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Get all series
router.get('/', async (req, res) => {
    try {
        const series = await Series.find();
        res.json(series);
    } catch (error) {
        console.error('Error fetching series:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get series by ID
// routers/series.js
router.get('/:id', async (req, res) => {
    try {
        const series = await Series.findById(req.params.id);
        if (!series) {
            return res.status(404).json({ message: 'Series not found' });
        }
        res.json(series);
    } catch (error) {
        console.error('Error fetching series:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


// Get comics by series ID
router.get('/:seriesId/comics', async (req, res) => {
    try {
        const comics = await Comic.find({ series: req.params.seriesId });
        if (!comics.length) {
            return res.status(404).json({ message: 'No comics found for this series' });
        }
        res.json(comics);
    } catch (error) {
        console.error('Error fetching comics:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/series/:id/comics', async (req, res) => {
    try {
        const comics = await Comic.find({ seriesId: req.params.id });
        res.json(comics);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const series = await Series.findById(req.params.id);
    if (!series) {
      return res.status(404).json({ message: 'Series not found' });
    }

    // ודא שרק היוצר יכול למחוק
    if (series.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // 🛠️ השתמש ב־findByIdAndDelete במקום remove
    await Series.findByIdAndDelete(req.params.id);

    res.json({ message: 'Series deleted successfully' });
  } catch (error) {
    console.error('Error deleting series:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


module.exports = router;