const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken

// Import routes
const userRouter = require('./routers/User');
const comicRouter = require('./routers/comics');
const searchRouter = require('./routers/Search');
const registerRoute = require('./routers/register');
const loginRoute = require('./routers/login');
const authRouter = require('./routers/Auth');
const seriesRouter = require('./routers/Series');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRouter);
app.use('/api/comics', comicRouter);
app.use('/api/search', searchRouter);
app.use('/api/register', registerRoute);
app.use('/api/login', loginRoute);
app.use('/api/auth', authRouter);
app.use('/api/series', seriesRouter);

require('dotenv').config();

// Define a test user object
const user = { _id: 'testUserId' }; // Replace with actual user ID for testing
const testToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
console.log('Test Token:', testToken);


// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
mongoose.connect('mongodb://localhost:27017/comixiad', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});