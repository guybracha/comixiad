const mongoose = require('mongoose');

const seriesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true // מסיר רווחים בתחילת ובסוף הכותרת
  },
  description: {
    type: String,
    maxlength: 500 // הגבלת אורך תיאור
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // יוצר הסדרה
  },
  comics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comic' // קומיקסים השייכים לסדרה
  }],
  createdAt: {
    type: Date,
    default: Date.now // תאריך יצירת הסדרה
  },
  updatedAt: {
    type: Date,
    default: Date.now // תאריך עדכון אחרון
  }
}, {
  timestamps: true // כולל את createdAt ו-updatedAt אוטומטית
});

module.exports = mongoose.model('Series', seriesSchema);
