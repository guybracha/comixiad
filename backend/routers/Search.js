const express = require('express');
const router = express.Router();
const Comic = require('../models/Comic');
const Series = require('../models/Series');
const User = require('../models/User');

// Search comics, series, and users by title or username
router.get('/', async (req, res) => {
    try {
        const { query } = req.query;
        const comics = await Comic.find({ title: { $regex: query, $options: 'i' } });
        const series = await Series.find({ title: { $regex: query, $options: 'i' } });
        const users = await User.find({ username: { $regex: query, $options: 'i' } });

        res.json({ comics, series, users });
    } catch (err) {
        console.error('Error fetching search results:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;