const express = require('express');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const multer = require('multer');
const cors = require('cors');
const comicsRouter = require('./api/comics'); // Path to your comics.js file
const registerRoute = require("./routers/Register"); // הנתיב לקובץ שמכיל את הקוד לעיל
const path = require('path');
const fs = require('fs');
const app = express();
const bodyParser = require("body-parser");

// Define your MongoDB URI
const mongoURI = 'mongodb://localhost:27017/comixiad'; // Update your Mongo URI

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000', // Only allow this domain
  methods: ['GET', 'POST'], // Adjust methods as needed
  allowedHeaders: ['Content-Type'] // Include additional headers if needed
}));

// Use express.json() to parse incoming JSON bodies
app.use(express.json()); // Add this line to parse JSON bodies

// MongoDB connection
mongoose
  .connect('mongodb://localhost:27017/comixiad', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB', err));


// Set up GridFS bucket after MongoDB connection
const conn = mongoose.connection;
conn.once('open', () => {
  const gfs = new GridFSBucket(conn.db, { bucketName: 'uploads' }); // GridFS bucket name

  // Multer setup to handle memory storage
  const storage = multer.memoryStorage();
  const upload = multer({ storage });

  // Route for file upload to GridFS
  app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    // Log file information to verify upload
    console.log('Uploaded file:', req.file.originalname);

    // Upload file to GridFS
    const stream = gfs.openUploadStream(req.file.originalname);
    stream.end(req.file.buffer);

    stream.on('finish', () => {
      console.log('File uploaded successfully!');
      res.status(200).send('File uploaded successfully!');
    });

    stream.on('error', (err) => {
      console.error('Error uploading file:', err);
      res.status(500).send('Failed to upload file.');
    });
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

  // Route to fetch file by ObjectId (alternative way to retrieve)
  app.get('/file/id/:fileId', (req, res) => {
    const fileId = new mongoose.Types.ObjectId(req.params.fileId); // Convert to correct ObjectId type
    const file = gfs.openDownloadStream(fileId);

    file.pipe(res);

    file.on('error', (err) => {
      console.error('Error fetching file:', err);
      res.status(500).send('Failed to fetch file.');
    });
  });

  // Route for uploading images in Base64 format (to the local filesystem)
  const saveImage = (base64String, imageName) => {
    const filePath = path.join(__dirname, 'public', 'images', imageName);
    const buffer = Buffer.from(base64String, 'base64');
    fs.writeFileSync(filePath, buffer);
  };

  app.post('/uploadBase64', (req, res) => {
    const base64Image = req.body.image; // Image as Base64 string
    const imageName = 'Page1.jpg'; // Name of the file to save as

    // Save the image as a file on the server
    saveImage(base64Image, imageName);

    res.send({ message: 'Image uploaded successfully' });
  });

  app.use(bodyParser.json());

  // API routes
  app.use('/api/comics', comicsRouter);
  app.use("/api", registerRoute);
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
  });

  // Start the server
  app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
  });
});
