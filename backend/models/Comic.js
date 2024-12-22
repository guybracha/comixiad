const mongoose = require('mongoose');

const ComicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    pages: [{ type: String, required: true }],  // Array of file paths or URLs to comic pages
    genre: { type: String, required: true },
    language: { type: String, required: true },
});

module.exports = mongoose.model('Comic', ComicSchema);
