const express = require('express');
const router = express.Router();
const Comic = require('../models/Comic');
const multer = require('multer');
const { verifyToken } = require('../middleware/auth');

// כל הגדרות storage כאן...

router.post('/upload', upload.array('pages', 50), async (req, res) => {
    try {
        const { title, description, language, genre, author, series } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No comic pages uploaded' });
        }

        const pages = req.files.map(file => ({
            url: `comics/${file.filename}` // שמור נתיב יחסי
        }));

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
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
