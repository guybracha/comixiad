const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true, // מסיר רווחים מיותרים בתחילת וסוף המחרוזת
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true, // מבטיח שמירת אימייל באותיות קטנות
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String, // שמירת URL לתמונה האישית
    default: null, // ערך ברירת מחדל
  },
  phone: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    default: null,
  },
  bio: {
    type: String, // שדה לביוגרפיה קצרה
    maxlength: 500, // הגבלת אורך
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
