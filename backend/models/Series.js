const mongoose = require('mongoose');

const SeriesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  coverImage: { type: String },
  author: { type: String, required: true }
});

module.exports = mongoose.model('Series', SeriesSchema);
