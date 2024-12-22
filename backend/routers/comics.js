const express = require('express');
const router = express.Router();
const { upload, gfs } = require('../config/db'); // Import the upload middleware from db.js
const Comic = require('../models/Comic');  // Assuming the Comic model is in models/Comic.js

// POST route for uploading comics
router.post('/upload', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const { title, description, genre, language } = req.body;

    if (!title || !description || !genre || !language) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const comic = new Comic({
      title,
      description,
      genre,
      language,
      fileIds: req.files.map(file => file.id),
      filenames: req.files.map(file => file.filename),
    });

    await comic.save();

    res.json({
      success: true,
      comicId: comic._id,
      fileIds: req.files.map(file => file.id),
      filenames: req.files.map(file => file.filename),
      title: comic.title,
      description: comic.description,
      genre: comic.genre,
      language: comic.language,
    });
  } catch (err) {
    console.error('Error uploading comic:', err);
    res.status(500).json({ success: false, message: 'Failed to upload comic' });
  }
});

// GET route for fetching all comics
router.get('/', async (req, res) => {
  try {
    const comics = await Comic.find();
    res.status(200).json({ comics });
  } catch (err) {
    console.error('Error fetching comics:', err);
    res.status(500).json({ message: 'Error fetching comics from database' });
  }
});

// GET route for fetching a specific comic by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const comic = await Comic.findById(id);
    if (!comic) {
      return res.status(404).json({ message: 'Comic not found' });
    }
    res.status(200).json({ comic });
  } catch (err) {
    console.error('Error fetching comic by ID:', err);
    res.status(500).json({ message: 'Error fetching comic by ID' });
  }
});

// GET route for streaming the comic file (using GridFS)
router.get('/file/:filename', (req, res) => {
  const { filename } = req.params;

  try {
    const fileStream = gfs.openDownloadStreamByName(filename);
    if (!fileStream) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.set('Content-Type', 'application/pdf'); 
    fileStream.pipe(res); 
  } catch (err) {
    console.error('Error fetching file:', err);
    res.status(500).json({ message: 'Error fetching file from GridFS' });
  }
});

module.exports = router;
