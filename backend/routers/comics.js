const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Comic = require('../models/Comic');
const verifyToken = require('../middleware/auth'); // Ensure verifyToken is imported correctly
const multer = require('multer'); // Ensure multer is imported

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir); // Store files in the 'uploads' directory
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Rename the file
    }
});

const upload = multer({ storage: storage });

router.post('/', verifyToken, upload.array('pages', 10), async (req, res) => { // 'pages' must match the field name in FormData
    try {
        const { title, description, language, genre, author, series } = req.body;
        const pages = req.files.map(file => ({ url: file.path }));

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

router.get('/', async (req, res) => {
    try {
        console.log('Fetching all comics...');
        const comics = await Comic.find().populate('author', 'username').sort({ createdAt: -1 });
        console.log(`Found ${comics.length} comics`);
        res.json(comics);
    } catch (error) {
        console.error('Error fetching comics:', error);
        res.status(500).json({ message: 'Error fetching comics', error: error.message });
    }
});

// Get comic by ID
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

// PUT request to update comic
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { title, description, language, genre } = req.body;

        // Fetch the comic by ID
        const comic = await Comic.findById(req.params.id);
        if (!comic) {
            return res.status(404).json({ message: 'Comic not found' });
        }

        // Check ownership
        if (req.user && comic.author.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Update the comic
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

// Delete comic by ID
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const comic = await Comic.findById(req.params.id);
        if (!comic) {
            return res.status(404).json({ message: 'Comic not found' });
        }

        // Check ownership
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

// Get comics by series ID
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

// Increase view count
router.put('/:id/view', async (req, res) => {
    try {
        const comic = await Comic.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
        if (!comic) return res.status(404).json({ message: 'Comic not found' });
        res.json(comic);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update views' });
    }
});

// Increase like count
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