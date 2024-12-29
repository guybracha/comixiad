const express = require('express');
const Series = require('../models/Series'); // נתיב נכון למודל
const router = express.Router();

// Create a new series
router.post('/', async (req, res) => {
  const { name, description, author } = req.body;
  try {
    const series = new Series({ name, description, author });
    await series.save();
    res.status(201).json(series);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all series
router.get('/', async (req, res) => {
  try {
    const seriesList = await Series.find().populate('author').populate('comics');
    res.json(seriesList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
