const mongoose = require('mongoose');

const comicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: { type: String, required: true },
  language: { type: String, required: true },
  coverImage: { type: String, default: '' }, // URL לתמונת הקאבר
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // מחבר הקומיקס
  pages: [
    {
      url: { type: String, required: true }, // נתיב או URL של התמונה
      mimetype: { type: String },
      size: { type: Number },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Comic', comicSchema);
