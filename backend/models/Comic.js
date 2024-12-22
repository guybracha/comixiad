// backend/models/comic.js
const mongoose = require('mongoose');

const comicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    genre: { type: String },
    language: { type: String },
    pages: [{ type: mongoose.Schema.Types.Mixed }] // Array to store images or other content
}, { timestamps: true });

const Comic = mongoose.model('Comic', comicSchema);

module.exports = Comic;
