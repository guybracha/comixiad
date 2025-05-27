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
const comicRouter = require('./routers/Comics');
const searchRouter = require('./routers/Search');
const registerRoute = require('./routers/Register');
const loginRoute = require('./routers/Login');
const authRouter = require('./routers/Auth');
const seriesRouter = require('./routers/Series');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

// Static files - חשובה במיוחד להצגת תמונות
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(cors({
        origin: 'https://comixiad.com',
        credentials: true,
        methods:['GET','POST','PUT','DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type','Authorization']
})) // ✅ מאפשר גישה מה-frontend
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({limit: '200mb', extended: true}));
app.use(helmet());
app.use(morgan('dev'));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
});
app.use(limiter);

app.options('*',cors());

// Routes
app.use('/api/users', userRouter);
app.use('/api/comics', comicRouter);
app.use('/api/search', searchRouter);
app.use('/api/register', registerRoute);
app.use('/api/login', loginRoute);
app.use('/api/auth', authRouter);
app.use('/api/series', seriesRouter); // ✅

app.get("/", (req, res) => {
  res.send("🚀 API is live at /api");
});

app.use((req, res, next) => {
  console.log(`➡️ API request: ${req.method} ${req.originalUrl}`);
  next();
});


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
  console.log('Registerd routes:',
        app._router.stack
        .filter(r => r.route)
        .map(r => r.route.path)
        );
  app.listen(PORT, '0.0.0.0',() => {
    console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
  });
}).catch(error => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});