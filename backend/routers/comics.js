const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Comic = require('../models/Comic');
const multer = require('multer');

// יצירת תיקיית העלאה אם לא קיימת
const uploadDir = path.join(__dirname, '../uploads/comics'); // ✔️
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer הגדרת
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // ✔️ ודא שזה מופעל!
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// 📌 יצירת קומיקס
router.post('/upload', upload.array('pages', 50), async (req, res) => {
    try {
        const { title, description, language, genre, author, series } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No comic pages uploaded' });
        }

        const pages = req.files.map(file => ({
            url: `uploads/comics/${file.filename}`
        }));
        console.log('Files uploaded:', req.files);

        const newComic = new Comic({
            title,
            description,
            language,
            genre,
            author,
            series: series || null,
            pages
        });

        await newComic.save();
        res.status(201).json({ message: 'Comic uploaded successfully', comic: newComic });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Error uploading comic', error: error.message });
    }
});

// 📥 שליפת כל הקומיקסים
router.get('/', async (req, res) => {
    try {
        const comics = await Comic.find().populate('author', 'username').sort({ createdAt: -1 });
        res.json(comics);
    } catch (error) {
        console.error('Error fetching comics:', error);
        res.status(500).json({ message: 'Error fetching comics', error: error.message });
    }
});

// 📥 שליפת קומיקס לפי ID (שימו לב – מופיע **אחרי** /series)
router.get('/series/:seriesId', async (req, res) => {
    try {
        const comics = await Comic.find({ series: req.params.seriesId }).populate('author', 'username');
        res.json(comics);
    } catch (error) {
        console.error('Error fetching comics by series:', error);
        res.status(500).json({ message: 'Error fetching comics by series', error: error.message });
    }
});

// ⚠️ חשוב: צריך להופיע **אחרי** /series כדי לא לבלוע אותו
router.get('/:id', async (req, res) => {
    try {
      const comic = await Comic.findById(req.params.id)
        .populate('author', 'username')
        .lean(); // כדי לאפשר שינוי ישיר באובייקט
  
      if (!comic) {
        return res.status(404).json({ message: 'Comic not found' });
      }
  
      // עדכון ה־URL של כל עמוד – יצירת כתובת מלאה לטעינה בדפדפן
      const baseUrl = `${req.protocol}://${req.get('host')}`; // למשל: http://localhost:5000
  
      comic.pages = comic.pages.map(page => ({
        ...page,
        url: `${baseUrl}/uploads/${page.url}` // מקשר ישירות לתמונה
      }));
  
      res.json(comic);
    } catch (error) {
      console.error('Error fetching comic by ID:', error);
      res.status(500).json({ message: 'Error fetching comic', error: error.message });
    }
  });
  

// ✅ עדכון קומיקס
router.put('/:id', async (req, res) => {
    try {
        const { title, description, language, genre } = req.body;
        const comic = await Comic.findById(req.params.id);
        if (!comic) return res.status(404).json({ message: 'Comic not found' });

        comic.title = title;
        comic.description = description;
        comic.language = language;
        comic.genre = genre;

        await comic.save();
        res.json(comic);
    } catch (error) {
        console.error('Error updating comic:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ✅ מחיקת קומיקס
router.delete('/:id', async (req, res) => {
    try {
        const comic = await Comic.findByIdAndDelete(req.params.id);
        if (!comic) return res.status(404).json({ message: 'Comic not found' });
        res.json({ message: 'Comic deleted successfully' });
    } catch (error) {
        console.error('Error deleting comic:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ✅ צפיות
router.put('/:id/view', async (req, res) => {
    try {
        const comic = await Comic.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
        if (!comic) return res.status(404).json({ message: 'Comic not found' });
        res.json(comic);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update views' });
    }
});

// ✅ לייקים
router.put('/:id/like', async (req, res) => {
    try {
        const { userId } = req.body;
        const comic = await Comic.findById(req.params.id);
        if (!comic) return res.status(404).json({ message: 'Comic not found' });

        if (comic.likedBy.includes(userId)) {
            return res.status(400).json({ message: 'User already liked this comic' });
        }

        comic.likes += 1;
        comic.likedBy.push(userId);
        await comic.save();

        res.json(comic);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update likes' });
    }
});

module.exports = router;
