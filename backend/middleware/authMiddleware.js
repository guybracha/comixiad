const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.verifyToken = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log("Token received:", token); // Debugging

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded JWT:", decoded); // Debugging

      req.user = await User.findById(decoded.userId).select('-password');

      if (!req.user) {
        return res.status(401).json({ error: 'User not found' });
      }

      next();
    } catch (error) {
      console.error("JWT verification error:", error);
      return res.status(403).json({ error: 'Token verification failed' });
    }
  } else {
    return res.status(403).json({ error: 'No token provided' });
  }
};

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log("🔑 Token received:", token); // הדפס את הטוקן לבדיקה
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("📌 Decoded token:", decoded); // ראה אם הדאטה חוזר כמו שצריך

      req.user = await User.findById(decoded.id).select('-password');
      console.log("👤 Authenticated user:", req.user);

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      console.error("❌ Token verification failed:", error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};
