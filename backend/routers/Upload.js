const express = require('express');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// Mongo URI
const mongoURI = process.env.MONGO_URI;
const conn = mongoose.createConnection(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Initialize GridFS storage
let gfs;
conn.once('open', () => {
    // Set up GridFS Bucket
    gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });
});

// GridFsStorage configuration
const storage = new GridFsStorage({
    db: conn.db,
    file: (req, file) => ({
        bucketName: 'uploads', // Store files in this bucket
        filename: `${Date.now()}-${file.originalname}`, // Save with timestamp to ensure unique filename
    }),
});
const upload = multer({ storage });

// Comic Schema
const ComicSchema = new mongoose.Schema({
    title: String,
    description: String,
    genre: String,
    language: String,
    fileIds: [mongoose.Schema.Types.ObjectId],
    filenames: [String],
    uploadDate: { type: Date, default: Date.now },
});

const Comic = mongoose.model('Comic', ComicSchema);

// Upload route
router.post('/upload', upload.array('files'), async (req, res) => {
    try {
        const { title, description, genre, language } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        // Save all file IDs and filenames
        const fileIds = req.files.map(file => file.id);
        const filenames = req.files.map(file => file.filename);

        const newComic = new Comic({
            title,
            description,
            genre,
            language,
            fileIds,
            filenames,
        });

        await newComic.save();
        res.status(201).json({ message: 'Comic uploaded successfully', comic: newComic });
    } catch (err) {
        console.error('Error uploading comic:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to fetch the first image from a comic
router.get('/image/:comicId', async (req, res) => {
    try {
        const { comicId } = req.params;
        const comic = await Comic.findById(comicId);

        if (!comic || !comic.filenames || comic.filenames.length === 0) {
            return res.status(404).json({ message: 'No images found for this comic' });
        }

        const pageFilename = comic.filenames[0]; // Get the filename of the first image

        // Fetch the image from GridFS
        gfs.openDownloadStreamByName(pageFilename)
            .pipe(res)
            .on('error', (err) => {
                console.error('Error fetching image:', err);
                res.status(404).json({ message: 'Image not found', error: err.message });
            });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
