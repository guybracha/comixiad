const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Comic = require('../models/Comic');
const verifyToken = require('../middleware/auth'); // Ensure verifyToken is imported correctly

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.post('/', upload.array('pages'), async (req, res) => {
    try {
        console.log('Request body:', req.body); // Debug logging
        console.log('Files:', req.files); // Debug logging

        const { title, description, author, series, language, genre } = req.body;
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const pages = req.files.map(file => ({
            url: file.filename
        }));

        const comicData = {
            title,
            description,
            author,
            language,
            genre,
            pages,
            series: series || null
        };

        console.log('Comic data:', comicData); // Debug logging

        const comic = new Comic(comicData);
        const savedComic = await comic.save();
        
        console.log('Saved comic:', savedComic); // Debug logging
        
        res.status(201).json(savedComic);
    } catch (error) {
        console.error('Upload error:', error); // Error logging
        res.status(500).json({ 
            message: 'Error uploading comic',
            error: error.message 
        });
    }
});

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
      const comic = await Comic.findById(req.params.id);
      if (!comic) {
          return res.status(404).json({ message: 'Comic not found' });
      }
      res.json(comic);
  } catch (error) {
      console.error('Error fetching comic:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update comic by ID
router.put('/:id', verifyToken, upload.array('pages'), async (req, res) => {
  try {
      const { title, description, language, genre } = req.body;
      const pages = req.files.map(file => file.path);

      const comic = await Comic.findById(req.params.id);
      if (!comic) {
          return res.status(404).json({ message: 'Comic not found' });
      }

      if (comic.author.toString() !== req.user._id) {
          return res.status(403).json({ message: 'Unauthorized' });
      }

      comic.title = title;
      comic.description = description;
      comic.language = language;
      comic.genre = genre;
      if (pages.length > 0) {
          comic.pages = pages;
      }

      await comic.save();
      res.json(comic);
  } catch (error) {
      console.error('Error updating comic:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get comics by series ID
router.get('/series/:seriesId', async (req, res) => {
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

module.exports = router;