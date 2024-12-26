const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    // Debug log
    console.log('Registration request body:', req.body);
    
    const { username, email, password, confirmPassword } = req.body;

    // Detailed validation
    const errors = [];
    if (!username) errors.push('שם משתמש חסר');
    if (!email) errors.push('אימייל חסר');
    if (!password) errors.push('סיסמא חסרה');
    if (!confirmPassword) errors.push('אימות סיסמא חסר');

    if (errors.length > 0) {
      console.log('Validation errors:', errors);
      return res.status(400).json({ error: errors.join(', ') });
    }

    if (password !== confirmPassword) {
      console.log('Password mismatch');
      return res.status(400).json({ error: "הסיסמאות אינן תואמות" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Email already exists:', email);
      return res.status(400).json({ error: "המייל כבר קיים במערכת" });
    }

    // Hash password and create user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    const savedUser = await newUser.save();
    console.log('User saved successfully:', savedUser._id);

    res.status(201).json({
      user: {
        _id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: "שגיאה בהרשמה" });
  }
});

module.exports = router;