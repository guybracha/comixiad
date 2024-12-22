const mongoose = require('mongoose');

const comicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: { type: String, required: true },
  language: { type: String, required: true },
  pages: [
    {
      url: { type: String, required: true }, // נתיב או URL של התמונה
      mimetype: { type: String },
      size: { type: Number },
    },
  ],
});

module.exports = mongoose.model('Comic', comicSchema);
