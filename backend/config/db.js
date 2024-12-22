const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
require('dotenv').config(); // Load environment variables
const path = require('path');

// MongoDB URI
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/comixiad';

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

const conn = mongoose.connection;

// Initialize GridFS stream
let gfs;
conn.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'comics' });
  console.log("GridFS Bucket initialized");
});

// Create GridFS storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  options: { useUnifiedTopology: true }, // Ensure options are passed
  file: (req, file) => ({
    bucketName: 'comics',
    filename: `${Date.now()}-${file.originalname}`,
    metadata: { uploadedBy: req.user?.id || 'anonymous' }, // Optional metadata
  }),
});

// Multer middleware for handling file uploads
const upload = multer({ storage });

module.exports = { upload, gfs };
