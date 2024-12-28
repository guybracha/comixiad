const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require("body-parser");
const { GridFSBucket } = require('mongodb');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // לקריאת משתנים סודיים
const comicsRouter = require('./routers/comics');
const registerRoute = require("./routers/Register");
const loginRoute = require('./routers/Login');
const userRoutes = require('./routers/User'); // נתיב ל-API של משתמשים
const authRouter = require('./routers/Auth');



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
app.use('/api/user', userRoutes);
app.use('/api/Auth', authRouter);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Default route for invalid paths
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  try {
      const user = await User.findOne({ email, password });
      if (!user) {
          return res.status(401).json({ message: 'Invalid email or password' });
      }
      res.status(200).json({ 
          username: user.username, 
          email: user.email, 
          token: 'fake-jwt-token' // להחליף עם JWT אמיתי
      });
  } catch (error) {
      res.status(500).json({ message: 'Server error' });
  }
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
