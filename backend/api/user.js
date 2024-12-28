const express = require('express');
const router = express.Router();
const User = require('../models/User'); // ייבוא מודל המשתמש
const jwt = require('jsonwebtoken');

// Middleware לאימות משתמש
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // בדוק אם הטוקן חוקי
    req.user = decoded; // שמור את פרטי המשתמש המבוקרים
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token.' });
  }
};

// נקודת קצה: שליפת נתוני המשתמש המחובר
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // שלוף את הנתונים בלי השדה של הסיסמה
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
