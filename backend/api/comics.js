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

  const { title, description, genre, language } = req.body;
  if (!title || !description || !genre || !language) {
    return res.status(400).send('Title, description, genre, and language are required.');
  }

  try {
    const pages = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size,
    }));

    const comic = new Comic({ title, description, genre, language, pages });
    await comic.save();

    res.status(201).json({ message: 'Comic uploaded successfully', comic });
  } catch (error) {
    console.error('Error uploading comic:', error.message);
    res.status(500).send('Failed to upload comic.');
  }
});

// Fetch all comics
router.get('/', async (req, res) => {
  try {
    const comics = await Comic.find(); // מבצע חיפוש על כל הקומיקסים במסד הנתונים
    res.json(comics);
  } catch (error) {
    console.error('Error fetching comics:', error);
    res.status(500).send('Failed to fetch comics.');
  }
});


module.exports = router;
