const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    }
});

const comicSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    series: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Series',
        default: null
    },
    language: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    pages: [pageSchema]
});

module.exports = mongoose.model('Comic', comicSchema);