const express = require('express');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const multer = require('multer');
const cors = require('cors');
const comicsRouter = require('./api/comics'); // Path to your comics.js file
const registerRoute = require("./routers/Register"); // הנתיב לקובץ שמכיל את הקוד לעיל
const loginRoute = require('./routers/Login');
const path = require('path');
const fs = require('fs');
const app = express();
const bodyParser = require("body-parser");

// Define your MongoDB URI
const mongoURI = 'mongodb://localhost:27017/comixiad'; // Update your Mongo URI

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000', // Only allow this domain
  methods: ['GET', 'POST'], // Adjust methods as needed
  allowedHeaders: ['Content-Type', 'Authorization'] // Include additional headers if needed
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize GridFS
let gfs;
const conn = mongoose.connection;
conn.once('open', () => {
  gfs = new GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
});

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Routes
app.use('/api/comics', comicsRouter);
app.use('/api/register', registerRoute);
app.use('/api/login', loginRoute);

// Route to upload file
app.post('/upload', upload.array('pages'), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files uploaded.');
  }

  try {
    const { title, description, genre, language } = req.body;
    const pages = req.files.map(file => file.filename);

    const newComic = new Comic({
      title,
      description,
      genre,
      language,
      pages,
      coverImage: pages[0] // Assuming the first page is the cover image
    });

    await newComic.save();
    res.status(201).send(newComic);
  } catch (error) {
    console.error('Error uploading comic:', error);
    res.status(500).send('Failed to upload comic.');
  }
});

// Route to fetch file by filename
app.get('/file/:filename', (req, res) => {
  const filename = req.params.filename;
  const file = gfs.openDownloadStreamByName(filename);

  // Set the appropriate headers to indicate file type
  res.set('Content-Type', 'image/jpeg');
  file.pipe(res);

  file.on('error', (err) => {
    console.error('Error fetching file:', err);
    res.status(500).send('Failed to fetch file.');
  });
});

// Comment out the static file serving for now
// Serve static files from the React app
// app.use(express.static(path.join(__dirname, '../frontend/build')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
// });

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});