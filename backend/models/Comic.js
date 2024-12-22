const mongoose = require('mongoose');

const comicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    genre: { type: String },
    language: { type: String },
    fileIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GridFSFile' }], // IDs of files in GridFS
    filenames: [String], // Optionally store the filenames for easier reference
}, { timestamps: true });

const Comic = mongoose.model('Comic', comicSchema);

module.exports = Comic;
