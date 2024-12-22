const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const path = require('path');

// MongoDB URI
const mongoURI = process.env.MONGO_URI;

// Create a MongoDB connection
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });

const conn = mongoose.connection;

// Initialize GridFS stream when the connection is open
let gfs;
conn.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'comics' });
});

// Create GridFS storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => ({
    bucketName: 'comics',
    filename: `${Date.now()}-${file.originalname}`,
  }),
});

const upload = multer({ storage });

module.exports = { upload, gfs };  // Export both upload middleware and gfs for future use
