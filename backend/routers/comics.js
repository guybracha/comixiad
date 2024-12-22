const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Comic = require('../models/Comic'); // שים לב לשימוש בנתיב הנכון
const router = express.Router();

// וודא שהתיקייה 'uploads/' קיימת, אם לא, צור אותה
const uploadPath = 'uploads/';
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// הגדרת Storage ב-Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // שמירת הקבצים בתיקיית 'uploads/'
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // יצירת שם קובץ ייחודי
  },
});

const upload = multer({ storage });

// נתיב להעלאת קומיקס
router.post('/upload', upload.array('pages'), async (req, res) => {
  try {
    // וודא שכל הנתונים החיוניים נשלחים
    const { title, description, genre, language } = req.body;
    if (!title || !description || !genre || !language) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // וודא שנשלחו קבצים
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    // יצירת אובייקט קומיקס חדש
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

    // שמירה למסד נתונים
    await comic.save();

    // שלח תשובה חיובית
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

module.exports = router;
