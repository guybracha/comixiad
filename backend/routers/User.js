const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

const authenticateUser = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, 'your_secret_key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = decoded; // מידע המשתמש שמפוענח מה-token
        next();
    });
};


// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.put('/:id', upload.single('avatar'), async (req, res) => {
    try {
        const { username, email, bio, firstName, lastName, dateOfBirth, location, favoriteGenres, twitter, instagram, deviantart } = req.body;
        const avatar = req.file ? req.file.path : null;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.username = username;
        user.email = email;
        user.bio = bio;
        user.firstName = firstName;
        user.lastName = lastName;
        user.dateOfBirth = dateOfBirth;
        user.location = location;
        user.favoriteGenres = favoriteGenres ? favoriteGenres.split(',').map(genre => genre.trim()) : [];
        user.socialLinks = { twitter, instagram, deviantart };
        if (avatar) {
            user.avatar = avatar;
        }

        await user.save();
        res.json(user);
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/:userId/following', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ followingSeries: user.followingSeries });
    } catch (error) {
        console.error('Error fetching following series:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;