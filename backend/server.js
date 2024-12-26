const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require("body-parser");
const { GridFSBucket } = require('mongodb');
const path = require('path');
const fs = require('fs');

const comicsRouter = require('./routers/comics');
const registerRoute = require("./routers/Register");
const loginRoute = require('./routers/Login');

const app = express();
const mongoURI = 'mongodb://localhost:27017/comixiad'; // Update your Mongo URI

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/comixiad')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));


// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const uploadsDir = path.join(__dirname, 'uploads');


// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// GridFS Initialization
let gfs;
const conn = mongoose.connection;
conn.once('open', () => {
  gfs = new GridFSBucket(conn.db, { bucketName: 'uploads' });
});

// Routes
app.use('/api/comics', comicsRouter);
app.use('/api/register', registerRoute);
app.use('/api/login', loginRoute);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Default route for invalid paths
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
