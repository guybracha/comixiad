const express = require('express');
const router = express.Router();
const multer = require('multer');
const Comic = require('../models/Comic'); // Assuming this is your Comic model

// Setup multer for handling file uploads
const storage = multer.memoryStorage(); // You can change this to file system storage if needed
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Only allow images (you can add more file types as needed)
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit for each file
  },
});

// GET route to fetch all comics
router.get('/', async (req, res) => {
  try {
    const comics = await Comic.find();
    res.json(comics);
  } catch (error) {
    console.error('Error fetching comics:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// POST route to upload comics (including images)
router.post('/upload', upload.array('pages'), async (req, res) => {
  // Check if files are uploaded
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files uploaded.');
  }

  // Ensure comic details are included in the request body
  const { title, description, genre, language } = req.body;
  if (!title || !description || !genre || !language) {
    return res.status(400).send('Title, description, genre, and language are required.');
  }

  try {
    // Process the uploaded files (you can store the image files in GridFS or local file system)
    const comicData = {
      title,
      description,
      genre,
      language,
      pages: req.files.map(file => ({
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        data: file.buffer, // Or you could store the file path if saved on disk or in GridFS
      })),
    };

    // Create and save the comic data to the database
    const comic = new Comic(comicData);
    await comic.save();

    res.status(200).send('Comic uploaded successfully!');
  } catch (error) {
    console.error('Error uploading comic:', error.message);
    res.status(500).send('Failed to upload comic.');
  }
});

module.exports = router;
