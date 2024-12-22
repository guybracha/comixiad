const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const cors = require('cors');
const dotenv = require('dotenv');
const comicRouter = require('./routers/comics');  // Import the comics routes
const gridfsStream = require('gridfs-stream');

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

// Initialize GridFS Stream once the connection is open
let gfs;
conn.once('open', () => {
  gfs = gridfsStream(conn.db, mongoose.mongo);
  gfs.collection('uploads');  // Ensure that GridFS uses the 'uploads' collection
  console.log("GridFS bucket initialized");
});

// Set up multer storage
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return {
      bucketName: 'uploads',
      filename: `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}` // Ensure unique filenames
    };
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10000000 }, // Set size limit (optional)
  timeout: 600000 // Set timeout to avoid upload issues with multiple files
});

// Create a Comic model for storing metadata
const comicSchema = new mongoose.Schema({
  title: String,
  description: String,
  genre: String,
  language: String,
  fileIds: [mongoose.Schema.Types.ObjectId], // Array of fileIds for multiple files
  filenames: [String], // Array of filenames for multiple files
  uploadDate: { type: Date, default: Date.now }
});

const Comic = mongoose.model('Comic', comicSchema);

// Express setup
const app = express();
const port = 5000;

const corsOptions = {
  origin: 'http://localhost:3000', // React frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/comics', comicRouter);  // This is where you include your comic routes

// Route for uploading comic files and metadata
app.post('/api/upload', upload.array('files'), async (req, res) => {
  const { title, description, genre, language } = req.body;

  if (!title || !description || !genre || !language || !req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'All fields and files are required' });
  }

  // Save the comic metadata and fileIds in the database
  const fileIds = req.files.map(file => file.id); // Get the fileIds of all files
  const filenames = req.files.map(file => file.filename); // Get the filenames

  const newComic = new Comic({
    title,
    description,
    genre,
    language,
    fileIds,  // Save array of fileIds
    filenames,  // Save array of filenames
  });

  try {
    await newComic.save();
    res.status(200).json({ comic: newComic });
  } catch (err) {
    console.error('Error saving comic:', err);
    res.status(500).json({ message: 'Error saving comic to database' });
  }
});

// Route for fetching all comics with metadata
app.get('/api/comics', async (req, res) => {
  try {
    const comics = await Comic.find();
    res.status(200).json({ comics });
  } catch (err) {
    console.error('Error fetching comics:', err);
    res.status(500).json({ message: 'Error fetching comics from database' });
  }
});

// Route for fetching a specific comic by fileId
app.get('/comic/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Find the comic metadata
    const comic = await Comic.findById(id);
    if (!comic) {
      return res.status(404).json({ message: 'Comic not found' });
    }

    // Fetch the comic file from GridFS
    const fileStream = gfs.openDownloadStream(comic.fileIds[0]); // Assuming single file per comic for now
    res.set('Content-Type', 'application/pdf'); // Set the content type (change as per the file type)
    fileStream.pipe(res);
  } catch (err) {
    console.error('Error fetching comic file:', err);
    res.status(500).json({ message: 'Error fetching comic file from GridFS' });
  }
});

// Route for fetching a comic image by filename (for displaying the file)
app.get('/image/:filename', (req, res) => {
  const { filename } = req.params;

  try {
    const fileStream = gfs.openDownloadStreamByName(filename);
    res.set('Content-Type', 'image/jpeg'); // Assuming it's a JPEG image; adjust based on your file type
    fileStream.pipe(res);
  } catch (err) {
    console.error('Error fetching image:', err);
    res.status(500).json({ message: 'Error fetching image from GridFS' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
