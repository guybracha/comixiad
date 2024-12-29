const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching user with ID:', id);

        if (!id) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const user = await User.findById(id).select('-password');
        
        if (!user) {
            console.log('User not found for ID:', id);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User found:', user);
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;