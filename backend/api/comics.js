const express = require('express');
const router = express.Router();
const Comic = require('./models/comic'); // נניח שזה המודל שלך

router.get('/', async (req, res) => {
    try {
        const comics = await Comic.find();
        res.json(comics);
    } catch (error) {
        console.error('Error fetching comics:', error.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
