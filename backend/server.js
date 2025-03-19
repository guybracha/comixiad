const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken

// Import routes
const userRouter = require('./routers/User');
const comicRouter = require('./routers/comics');
const searchRouter = require('./routers/Search');
const registerRoute = require('./routers/Register');
const loginRoute = require('./routers/Login');
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

require('dotenv').config(); // Make sure .env file is loaded properly

app._router.stack.forEach(layer => {
  if (layer.route) {
    console.log("✅ Active route:", layer.route.path);
  }
});


// Error handling for missing JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in the .env file');
  process.exit(1); // Exit the application if JWT_SECRET is missing
}

// Define a test user object (remove or modify as needed)
const user = { _id: 'testUserId' }; // Replace with actual user ID for testing
// Generate a test token (remove this in production code)
const testToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
console.log('Test Token:', testToken); // Remove or use for testing

// Error handling middleware for unhandled errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server after successful MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/comixiad', {
  useNewUrlParser: true,
  useUnifiedTopology: true,  // Add this option for better handling of MongoDB connections
}).then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(error => {
  console.error('MongoDB connection error:', error);
  process.exit(1); // Exit the application if MongoDB connection fails
});
