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
    gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });
});

// GridFsStorage configuration
const storage = new GridFsStorage({
    db: conn.db,
    file: (req, file) => ({
        bucketName: 'uploads', // Store files in this bucket
        filename: `${Date.now()}-${file.originalname}`,
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

module.exports = router;
