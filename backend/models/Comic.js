const mongoose = require('mongoose');

const comicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: { type: String, required: true },
  language: { type: String, required: true },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false 
  },
  pages: [
    {
      filename: { 
        type: String, 
        required: true,
        default: function() {
          return `page_${Date.now()}`
        }
      },
      url: { type: String },
      mimetype: { type: String },
      size: { type: Number },
    },
  ],
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Comic', comicSchema);