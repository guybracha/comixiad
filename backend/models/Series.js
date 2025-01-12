const mongoose = require('mongoose');

const SeriesSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    coverImage: { type: String },
    author: { type: String, required: true },
    followers: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] }, // רשימת עוקבים
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Series', SeriesSchema);
