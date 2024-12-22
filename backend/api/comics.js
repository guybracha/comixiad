const express = require('express');
const router = express.Router();
const multer = require('multer');
const Comic = require('../models/Comic'); // Assuming this is your model

// Setup multer for handling file uploads
const storage = multer.memoryStorage(); // You can change this to file system storage if needed
const upload = multer({ storage: storage });

// GET route to fetch all comics
router.get('/', async (req, res) => {
    try {
        const comics = await Comic.find();
        res.json(comics);
    } catch (error) {
        console.error('Error fetching comics:', error.message);
        res.status(500).send('Server error');
    }
});

// POST route to upload comics (including images)
router.post('/upload', upload.array('pages'), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No files uploaded.');
    }

    // Here you would process the uploaded files and any other data (e.g., save them to your database)
    try {
        // Assuming you're saving some metadata like title, description along with the files
        const comicData = {
            title: req.body.title,
            description: req.body.description,
            genre: req.body.genre,
            language: req.body.language,
            pages: req.files // Saving the uploaded files
        };

        const comic = new Comic(comicData);
        await comic.save();

        res.status(200).send('Comic uploaded successfully!');
    } catch (error) {
        console.error('Error uploading comic:', error.message);
        res.status(500).send('Failed to upload comic.');
    }
});

module.exports = router;
