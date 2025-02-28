const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Comic = require('../models/Comic');
const verifyToken = require('../middleware/auth');
const multer = require('multer');

// יצירת תיקיית העלאה אם היא לא קיימת
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// הגדרת Multer לאחסון קבצים
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// *** העלאת קומיקס ***
router.post('/', verifyToken, upload.array('pages', 10), async (req, res) => {
    try {
        console.log('Received upload request:', req.body);
        console.log('Files uploaded:', req.files);

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const { title, description, language, genre, author, series } = req.body;
        if (!title || !description || !language || !genre || !author) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const pages = req.files.map(file => ({ url: `/uploads/${file.filename}` }));

        const newComic = new Comic({
            title,
            description,
            language,
            genre,
            author,
            series,
            pages
        });

        await newComic.save();

        res.status(201).json({ message: 'Comic uploaded successfully', comic: newComic });
    } catch (error) {
        console.error('Error uploading comic:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// *** שליפת כל הקומיקסים ***
router.get('/', async (req, res) => {
    try {
        const comics = await Comic.find().populate('author', 'username').sort({ createdAt: -1 });
        res.json(comics);
    } catch (error) {
        console.error('Error fetching comics:', error);
        res.status(500).json({ message: 'Error fetching comics', error: error.message });
    }
});

// *** שליפת קומיקס לפי ID ***
router.get('/:id', async (req, res) => {
    try {
        const comic = await Comic.findById(req.params.id).populate('author', 'username');
        if (!comic) {
            return res.status(404).json({ message: 'Comic not found' });
        }
        res.json(comic);
    } catch (error) {
        console.error('Error fetching comic by ID:', error);
        res.status(500).json({ message: 'Error fetching comic', error: error.message });
    }
});

// *** עדכון קומיקס ***
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { title, description, language, genre } = req.body;

        const comic = await Comic.findById(req.params.id);
        if (!comic) {
            return res.status(404).json({ message: 'Comic not found' });
        }

        if (req.user && comic.author.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

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

// *** מחיקת קומיקס ***
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const comic = await Comic.findById(req.params.id);
        if (!comic) {
            return res.status(404).json({ message: 'Comic not found' });
        }

        if (comic.author.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await comic.remove();
        res.json({ message: 'Comic deleted successfully' });
    } catch (error) {
        console.error('Error deleting comic:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// *** הגדלת מספר הצפיות ***
router.put('/:id/view', async (req, res) => {
    try {
        const comic = await Comic.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
        if (!comic) return res.status(404).json({ message: 'Comic not found' });
        res.json(comic);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update views' });
    }
});

// *** הגדלת מספר הלייקים ***
router.put('/:id/like', async (req, res) => {
    try {
        const comic = await Comic.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
        if (!comic) return res.status(404).json({ message: 'Comic not found' });
        res.json(comic);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update likes' });
    }
});

module.exports = router;
