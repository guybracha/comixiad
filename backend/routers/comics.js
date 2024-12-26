const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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

// Route to upload a comic
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

// Route to fetch all comics
router.get('/', async (req, res) => {
  try {
    const comics = await Comic.find();
    res.json(comics);
  } catch (error) {
    console.error('Error fetching comics:', error);
    res.status(500).send('Failed to fetch comics.');
  }
});

// Route to fetch a specific comic image
router.get('/image/:comicId', async (req, res) => {
  try {
    const comic = await Comic.findById(req.params.comicId);
    if (!comic || !comic.pages || comic.pages.length === 0) {
      return res.status(404).json({ message: 'No images found for this comic' });
    }

    const pageFilename = comic.pages[0].url; // Get the first page (modify this logic if needed)

    if (pageFilename) {
      const filePath = path.join(__dirname, '../uploads', pageFilename); // Local filesystem path
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath); // Send the file as a response
      } else {
        return res.status(404).json({ message: 'Image not found on server' });
      }
    } else {
      return res.status(404).json({ message: 'Image not found' });
    }
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).send('Failed to fetch image.');
  }
});

// Serve static files from the uploads directory
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

module.exports = router;