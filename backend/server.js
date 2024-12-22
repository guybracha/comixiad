const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const cors = require('cors');
const dotenv = require('dotenv');
const gridfsStream = require('gridfs-stream');
const comicsRouter = require('./routers/comics'); // תיקון נתיב הייבוא

dotenv.config();

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  throw new Error('Mongo URI is not defined in .env file');
}

// Create MongoDB connection
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const conn = mongoose.connection;

// Initialize GridFS Stream and multer storage
let gfs;
let upload; // Declare upload for later initialization

conn.once('open', () => {
  console.log("MongoDB connection is open");
  
  // Initialize GridFS stream
  gfs = gridfsStream(conn.db, mongoose.mongo);
  gfs.collection('uploads'); // Use the 'uploads' collection
  
  // Initialize GridFsStorage
  const storage = new GridFsStorage({
    db: conn.db, // Pass the active db instance
    file: (req, file) => ({
      bucketName: 'uploads', // GridFS bucket name
      filename: `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`,
    }),
  });

  upload = multer({ storage }); // Assign multer with storage
  console.log("GridFsStorage initialized");
});

// Express setup
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Route for uploading files
app.post('/api/upload', (req, res, next) => {
  if (!upload) {
    return res.status(500).json({ message: 'File upload middleware not initialized' });
  }
  upload.array('files')(req, res, next);
}, async (req, res) => {
  const { title, description, genre, language } = req.body;

  if (!title || !description || !genre || !language || !req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'All fields and files are required' });
  }

  const fileIds = req.files.map(file => file.id);
  const filenames = req.files.map(file => file.filename);

  const Comic = mongoose.model('Comic');  // use pre-defined model

  const newComic = new Comic({ title, description, genre, language, fileIds, filenames });

  try {
    await newComic.save();
    res.status(200).json({ comic: newComic });
  } catch (err) {
    console.error('Error saving comic:', err);
    res.status(500).json({ message: 'Error saving comic to database' });
  }
});

app.use('/api/comics', comicsRouter);  // תיקון כאן

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
