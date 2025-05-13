const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// === MULTER CONFIG ===
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// === AUTH MIDDLEWARE ===
const authenticateUser = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Unauthorized - no token' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });
        req.user = decoded;
        next();
    });
};

// === GET USER BY ID ===
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// === GET CURRENT USER ===
router.get('/me', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// === UPDATE USER PROFILE ===
router.put('/:id', authenticateUser, upload.single('avatar'), async (req, res) => {
    try {
        if (req.user.userId !== req.params.id) {
            return res.status(403).json({ message: 'Unauthorized profile edit' });
        }

        const {
            username,
            email,
            bio,
            firstName,
            lastName,
            dateOfBirth,
            location,
            favoriteGenres,
            twitter,
            instagram,
            deviantart
        } = req.body;

        const avatar = req.file ? req.file.path.replace(/\\/g, '/') : null;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.username = username || user.username;
        user.email = email || user.email;
        user.bio = bio || user.bio;
        user.firstName = firstName;
        user.lastName = lastName;
        user.dateOfBirth = dateOfBirth;
        user.location = location;

        if (favoriteGenres) {
            user.favoriteGenres = typeof favoriteGenres === 'string'
                ? JSON.parse(favoriteGenres)
                : favoriteGenres;
        }

        user.socialLinks = {
            twitter,
            instagram,
            deviantart
        }
        
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

// === FOLLOW SERIES ===
router.post('/follow', authenticateUser, async (req, res) => {
    const { seriesId } = req.body;
    try {
        const user = await User.findById(req.user.userId);
        if (!user.followingSeries.includes(seriesId)) {
            user.followingSeries.push(seriesId);
            await user.save();
        }
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Failed to follow series.' });
    }
});

// === UNFOLLOW SERIES ===
router.post('/unfollow', authenticateUser, async (req, res) => {
    const { seriesId } = req.body;
    try {
        const user = await User.findById(req.user.userId);
        user.followingSeries = user.followingSeries.filter(id => id.toString() !== seriesId);
        await user.save();
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Failed to unfollow series.' });
    }
});

// === CHECK IF FOLLOWING ===
router.get('/following/:seriesId', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const isFollowing = user.followingSeries.includes(req.params.seriesId);
        res.status(200).json({ isFollowing });
    } catch (err) {
        res.status(500).json({ message: 'Failed to check following status.' });
    }
});

module.exports = router;
