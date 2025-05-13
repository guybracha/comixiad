const express = require('express');
const router = express.Router();
const Comic = require('../models/Comic');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid'); // 📦 npm install uuid

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir); // צור את התיקייה אם לא קיימת
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = uuidv4() + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ✅ Upload a new comic (protected route)
router.post('/upload', verifyToken, upload.array('pages', 10), async (req, res) => {
  try {
    const { title, description, language, genre, author, series } = req.body;

    // ודא שקבצים קיימים
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No comic pages uploaded' });
    }

    // צור מערך של קישורים לתמונות
    const pages = req.files.map(file => ({
      url: `comics/${file.filename}` // שמור רק נתיב יחסי מתוך /uploads
    }));
    

    const newComic = new Comic({
      title,
      description,
      language,
      genre,
      author,
      series,
      pages,
      uploadedBy: req.user?.userId || null, // נשמר רק אם יש טוקן
    });

    await newComic.save();

    res.status(201).json({
      message: 'Comic uploaded successfully',
      comic: newComic,
    });
  } catch (error) {
    console.error('Error uploading comic:', error);
    res.status(500).json({
      message: 'Server error while uploading comic',
      error: error.message,
    });
  }
});

module.exports = router;
