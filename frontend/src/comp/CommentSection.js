// frontend/src/comp/CommentSection.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../Config';
import { useUser } from '../context/UserContext';
import { useTranslation } from 'react-i18next';
import '../Comments.css';

const CommentSection = ({ comicId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const { user } = useUser();
  const { t } = useTranslation();

  // טעינת תגובות
  useEffect(() => {
    fetchComments();
  }, [comicId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/api/comics/${comicId}/comments`);
      setComments(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  // הוספת תגובה
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert(t('pleaseLogin') || 'Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${API_BASE_URL}/api/comics/${comicId}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setComments([data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
      alert('Failed to post comment');
    }
  };

  // מחיקת תגובה
  const handleDelete = async (commentId) => {
    if (!window.confirm(t('confirmDelete') || 'Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setComments(comments.filter(c => c._id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment');
    }
  };

  // עריכת תגובה
  const handleEdit = async (commentId) => {
    if (!editContent.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put(
        `${API_BASE_URL}/api/comments/${commentId}`,
        { content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setComments(comments.map(c => c._id === commentId ? data : c));
      setEditingId(null);
      setEditContent('');
    } catch (err) {
      console.error('Error editing comment:', err);
      alert('Failed to edit comment');
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment._id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) return 'https://www.gravatar.com/avatar/?d=mp';
    if (avatar.startsWith('http')) return avatar;
    return `${API_BASE_URL}/${avatar.replace(/\\/g, '/')}`;
  };

  if (loading && comments.length === 0) {
    return <div className="comments-loading">Loading comments...</div>;
  }

  return (
    <div className="comments-section">
      <h3 className="comments-title">
        💬 {t('comments') || 'Comments'} ({comments.length})
      </h3>

      {/* טופס הוספת תגובה */}
      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <div className="comment-input-group">
            <img 
              src={getAvatarUrl(user.avatar)} 
              alt={user.username}
              className="comment-avatar-small"
            />
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t('writeComment') || 'Write a comment...'}
              className="comment-textarea"
              rows="3"
              maxLength="1000"
            />
          </div>
          <div className="comment-form-footer">
            <span className="char-count">{newComment.length}/1000</span>
            <button 
              type="submit" 
              className="btn btn-primary btn-sm"
              disabled={!newComment.trim()}
            >
              {t('postComment') || 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="login-prompt">
          <p>{t('loginToComment') || 'Please login to leave a comment'}</p>
        </div>
      )}

      {/* רשימת תגובות */}
      <div className="comments-list">
        {error && <div className="alert alert-danger">{error}</div>}
        
        {comments.length === 0 ? (
          <p className="no-comments">{t('noComments') || 'No comments yet. Be the first to comment!'}</p>
        ) : (
          comments.map(comment => (
            <div key={comment._id} className="comment-item">
              <img 
                src={getAvatarUrl(comment.user?.avatar)} 
                alt={comment.user?.username}
                className="comment-avatar"
              />
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-author">{comment.user?.username}</span>
                  <span className="comment-date">{formatDate(comment.createdAt)}</span>
                </div>
                
                {editingId === comment._id ? (
                  <div className="comment-edit-form">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="comment-textarea"
                      rows="3"
                      maxLength="1000"
                    />
                    <div className="comment-edit-actions">
                      <button 
                        onClick={() => handleEdit(comment._id)}
                        className="btn btn-sm btn-success"
                      >
                        {t('save') || 'Save'}
                      </button>
                      <button 
                        onClick={cancelEdit}
                        className="btn btn-sm btn-secondary"
                      >
                        {t('cancel') || 'Cancel'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="comment-text">{comment.content}</p>
                    {user && user._id === comment.user?._id && (
                      <div className="comment-actions">
                        <button 
                          onClick={() => startEdit(comment)}
                          className="btn-link"
                        >
                          {t('edit') || 'Edit'}
                        </button>
                        <button 
                          onClick={() => handleDelete(comment._id)}
                          className="btn-link text-danger"
                        >
                          {t('delete') || 'Delete'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
