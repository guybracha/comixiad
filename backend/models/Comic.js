const mongoose = require('mongoose');

const comicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: { type: String, required: true },
  language: { type: String, required: true },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  series: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Series', 
    default: null // קומיקס שלא שייך לסדרה
  },
  pages: [
    {
      filename: { 
        type: String, 
        required: true 
      },
      url: { type: String },
      mimetype: { type: String },
      size: { type: Number }
    }
  ],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  views: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Comic', comicSchema);
