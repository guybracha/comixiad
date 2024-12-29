const express = require('express');
const router = express.Router();
const Series = require('../models/Series');
const multer = require('multer');
const path = require('path');

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
router.post('/', upload.single('coverImage'), async (req, res) => {
    try {
        const { name, description, author } = req.body;
        const coverImage = req.file ? req.file.filename : null;

        if (!name || !description || !author) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newSeries = new Series({
            name,
            description,
            coverImage,
            author
        });

        const savedSeries = await newSeries.save();
        res.status(201).json(savedSeries);
    } catch (err) {
        console.error('Error creating series:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.get('/', async (req, res) => {
  try {
    const series = await Series.find();
    res.json(series);
  } catch (err) {
    console.error('Error fetching series:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Fetch single series by ID
router.get('/:id', async (req, res) => {
  try {
      const series = await Series.findById(req.params.id);
      if (!series) {
          return res.status(404).json({ message: 'Series not found' });
      }
      res.json(series);
  } catch (err) {
      console.error('Error fetching series:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
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


module.exports = router;