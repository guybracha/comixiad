const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
  } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
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

router.post('/follow', async (req, res) => {
    const { userId, seriesId } = req.body;
    try {
      const user = await User.findById(userId);
      if (!user.followingSeries.includes(seriesId)) {
        user.followingSeries.push(seriesId);
        await user.save();
      }
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ message: 'Failed to follow series.' });
    }
  });
  
  // Unfollow a series
  router.post('/unfollow', async (req, res) => {
    const { userId, seriesId } = req.body;
    try {
      const user = await User.findById(userId);
      user.followingSeries = user.followingSeries.filter((id) => id.toString() !== seriesId);
      await user.save();
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ message: 'Failed to unfollow series.' });
    }
  });
  
  // Check if following
  router.get('/following/:seriesId', async (req, res) => {
    const { userId } = req.query;
    const { seriesId } = req.params;
    try {
      const user = await User.findById(userId);
      const isFollowing = user.followingSeries.includes(seriesId);
      res.status(200).json({ isFollowing });
    } catch (err) {
      res.status(500).json({ message: 'Failed to check following status.' });
    }
  });

module.exports = router;