const mongoose = require('mongoose');

// יצירת מודל קומיקס עם שדות נדרשים
const comicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: { type: String, required: true },
  language: { type: String, required: true },
  fileIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
  filenames: [String],
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Comic', comicSchema);
