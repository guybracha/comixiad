const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("./models/User");  // הנתיב למודל המשתמש שלך
const router = express.Router();

// API לרישום משתמש
router.post("/register", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // בדיקת האם כל השדות הוזנו
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // בדיקת אם הסיסמאות תואמות
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  // בדיקת אם כתובת האימייל כבר קיימת במערכת
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email is already registered." });
  }

  try {
    // גיבוב הסיסמה לפני שמירתה בבסיס הנתונים
    const hashedPassword = await bcrypt.hash(password, 10);

    // יצירת משתמש חדש
    const newUser = new User({
      name,
      email,
      password: hashedPassword,  // שים לב לשימוש בסיסמה הגיבובית
    });

    // שמירת המשתמש בבסיס הנתונים
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred. Please try again later." });
  }
});

module.exports = router;
