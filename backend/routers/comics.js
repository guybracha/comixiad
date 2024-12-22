const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Comic = require('../models/Comic'); // Make sure to use the correct path
const router = express.Router();
const mongoose = require('mongoose');

// Ensure the 'uploads/' folder exists, create it if not
const uploadPath = 'uploads/';
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// Multer Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // Save the files in 'uploads/' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Create a unique filename
  },
});

const upload = multer({ storage });

// Route to upload comics
router.post('/upload', upload.array('files'), async (req, res) => {
  try {
    // Validate essential data fields
    const { title, description, genre, language } = req.body;
    if (!title || !description || !genre || !language) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Validate that files are uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    // Create a new Comic object with the uploaded files and metadata
    const comic = new Comic({
      title,
      description,
      genre,
      language,
      pages: req.files.map((file) => ({
        filename: file.filename,
        path: file.path,
      })),
    });

    // Save comic to the database
    await comic.save();

    // Respond with success message and comic ID
    res.status(201).json({
      success: true,
      comicId: comic._id,
      message: 'Comic uploaded successfully',
    });
  } catch (error) {
    console.error('Error saving comic:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
    });
  }
});

// Route to fetch comic image by ID
router.get('/image/:comicId', async (req, res) => {
  try {
    const { comicId } = req.params;
    const comic = await Comic.findById(comicId);

    // Ensure the comic and pages exist
    if (!comic || !comic.pages || comic.pages.length === 0) {
      return res.status(404).json({ message: 'No images found for this comic' });
    }

    const pageFilename = comic.pages[0].filename; // Get the first page (modify this logic if needed)

    if (pageFilename) {
      // If file is stored on the local filesystem, return it
      const filePath = path.join(uploadPath, pageFilename); // Local filesystem path
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath); // Send the file as a response
      } else {
        return res.status(404).json({ message: 'Image not found on server' });
      }
    } else {
      // If file is stored in GridFS, fetch from GridFS (you must set up GridFS)
      const gfs = mongoose.mongo.GridFSBucket; // You need to initialize GridFSBucket based on your MongoDB setup
      const bucket = new gfs(mongoose.connection.db, { bucketName: 'comics' });

      const fileStream = bucket.openDownloadStreamByName(pageFilename);
      fileStream.pipe(res);
      fileStream.on('error', (err) => {
        res.status(404).json({ message: 'Image not found in GridFS', error: err.message });
      });
    }
  } catch (err) {
    console.error('Error fetching comic image:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
