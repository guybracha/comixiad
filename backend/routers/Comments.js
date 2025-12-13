// backend/routers/Comments.js
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { protect } = require('../middleware/authMiddleware');

// GET - קבלת כל התגובות של קומיקס
router.get('/comics/:comicId/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ comic: req.params.comicId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

// POST - יצירת תגובה חדשה (דורש אימות)
router.post('/comics/:comicId/comments', protect, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    
    if (content.length > 1000) {
      return res.status(400).json({ message: 'Comment is too long (max 1000 characters)' });
    }
    
    const comment = new Comment({
      content: content.trim(),
      user: req.user._id,
      comic: req.params.comicId
    });
    
    await comment.save();
    await comment.populate('user', 'username avatar');
    
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Failed to create comment' });
  }
});

// DELETE - מחיקת תגובה (רק בעלים או admin)
router.delete('/comments/:commentId', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // בדיקה שהמשתמש הוא בעלים של התגובה או admin
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});

// PUT - עדכון תגובה (רק בעלים)
router.put('/comments/:commentId', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    
    comment.content = content.trim();
    comment.updatedAt = Date.now();
    await comment.save();
    await comment.populate('user', 'username avatar');
    
    res.json(comment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Failed to update comment' });
  }
});

module.exports = router;
