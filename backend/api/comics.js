const express = require('express');
const router = express.Router();
const multer = require('multer');
const Comic = require('../models/Comic'); // Assuming this is your Comic model

// Setup multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/upload', upload.array('pages'), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files uploaded.');
  }

  try {
    const { title, description, genre, language, author } = req.body;
    const pages = req.files.map(file => ({
      url: file.filename,
      mimetype: file.mimetype,
      size: file.size,
    }));

    const newComic = new Comic({
      title,
      description,
      genre,
      language,
      coverImage: pages[0].url, // Assuming the first page is the cover image
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

router.get('/', async (req, res) => {
  try {
    const comics = await Comic.find();
    res.json(comics);
  } catch (error) {
    console.error('Error fetching comics:', error);
    res.status(500).send('Failed to fetch comics.');
  }
});

// Serve static files from the uploads directory
router.use('/uploads', express.static('uploads'));

module.exports = router;