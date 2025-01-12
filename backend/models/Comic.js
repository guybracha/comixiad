const mongoose = require('mongoose');

const comicSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    language: { type: String, required: true },
    genre: { type: String, required: true },
    pages: [{ url: { type: String, required: true } }],
    series: { type: String, default: null },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // משתמשים שנתנו לייק
}, { timestamps: true });

const Comic = mongoose.model('Comic', comicSchema);

module.exports = Comic;
