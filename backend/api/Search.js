const express = require('express');
const router = express.Router();
const Comic = require('../models/Comic');

router.get('/', async (req, res) => {
    try {
        const { query } = req.query;
        const comics = await Comic.find({ title: { $regex: query, $options: 'i' } });
        res.json(comics);
    } catch (err) {
        console.error('Error fetching search results:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;