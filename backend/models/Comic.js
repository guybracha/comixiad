const mongoose = require('mongoose');

const comicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    language: { type: String, required: true },
    genre: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    series: { type: mongoose.Schema.Types.ObjectId, ref: 'Series' },
    pages: [{ url: { type: String, required: true } }],
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // ✅ הוסף שדה זה
}, { timestamps: true });

module.exports = mongoose.model('Comic', comicSchema);
