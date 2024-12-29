const express = require('express');
const router = express.Router();
const Comic = require('../models/Comic');
const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// Upload a new comic
router.post('/', upload.array('pages'), async (req, res) => {
    try {
        const { title, description, author, series, language, genre } = req.body;
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const pages = req.files.map(file => ({
            url: file.filename
        }));

        const comicData = {
            title,
            description,
            author,
            language,
            genre,
            pages,
            series: series || null
        };

        const comic = new Comic(comicData);
        await comic.save();

        res.status(201).json(comic);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            message: 'Error uploading comic',
            error: error.message 
        });
    }
});

module.exports = router;