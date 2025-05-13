const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config(); // חשוב לייבא לפני השימוש

// Routers
const userRouter = require('./routers/User');
const comicRouter = require('./routers/comics');
const searchRouter = require('./routers/Search');
const registerRoute = require('./routers/Register');
const loginRoute = require('./routers/Login');
const authRouter = require('./routers/Auth');
const seriesRouter = require('./routers/Series');

const app = express();
const PORT = process.env.PORT || 5000;

// Static files - חשובה במיוחד להצגת תמונות
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(cors({ origin: 'http://localhost:3000' })); // ✅ מאפשר גישה מה-frontend
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Routes
app.use('/api/users', require('./routers/User'));
app.use('/api/comics', comicRouter);
app.use('/api/search', searchRouter);
app.use('/api/register', registerRoute);
app.use('/api/login', loginRoute);
app.use('/api/auth', authRouter);
app.use('/api/series', seriesRouter);

// Debug: List active routes
app._router.stack.forEach(layer => {
  if (layer.route) {
    console.log("✅ Active route:", layer.route.path);
  }
});

// Error handling for missing env vars
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in the .env file');
  process.exit(1);
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/comixiad', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});
