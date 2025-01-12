const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    bio: { type: String },
    location: { type: String },
    favoriteGenres: [String],
    socialLinks: {
        twitter: { type: String },
        instagram: { type: String },
        deviantart: { type: String }
    },
    avatar: { type: String },
    joinDate: { type: Date, default: Date.now },
    followingSeries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Series' }]
});

module.exports = mongoose.model('User', userSchema);