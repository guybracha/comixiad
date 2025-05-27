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

// ✅ Get comics (with optional filtering by author)
router.get('/', async (req, res) => {
  try {
    const filter = {};

    if (req.query.author) {
      filter.author = req.query.author;
    }

    const comics = await Comic.find(filter).populate('author', 'username');
    res.json(comics);
  } catch (error) {
    console.error('Error fetching comics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// ✅ Get a specific comic by ID
router.get('/:id', async (req, res) => {
  try {
    const comic = await Comic.findById(req.params.id).populate('author', 'username avatar');

    if (!comic) {
      return res.status(404).json({ message: 'Comic not found' });
    }

    // צור כתובת מלאה לכל עמוד בקומיקס
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    comic.pages = comic.pages.map(page => ({
      ...page,
      url: `${baseUrl}/uploads/${page.url}` // שים לב לנתיב נכון
    }));

    res.json(comic);
  } catch (error) {
    console.error('Error fetching comic by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/by-author/:userId', async (req, res) => {
  try {
    const comics = await Comic.find({ author: req.params.userId })
      .populate('author', 'username');
    res.json(comics);
  } catch (error) {
    console.error('Error fetching comics by author:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



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

// ✅ Increase views by 1 for a specific comic
router.patch('/:id/view', async (req, res) => {
  try {
    const comic = await Comic.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!comic) {
      return res.status(404).json({ message: 'Comic not found' });
    }

    res.json({ message: 'View count updated', views: comic.views });
  } catch (error) {
    console.error('Error updating views:', error);
    res.status(500).json({ message: 'Server error while updating views' });
  }
});


module.exports = router;