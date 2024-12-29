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
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update user profile
router.put('/:id', async (req, res) => {
    try {
        console.log('Updating user:', req.params.id);
        console.log('Update data:', req.body);

        const updates = { ...req.body };
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Updated user:', user);
        res.json(user);
    } catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ message: 'Error updating user' });
    }
});

module.exports = router;