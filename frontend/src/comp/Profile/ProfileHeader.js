import React from 'react';
import { Button } from 'react-bootstrap';

const ProfileHeader = ({ profile, onEdit }) => {
  // ✅ עיבוד כתובת תמונה
  const avatarUrl = profile.avatar?.startsWith('http')
    ? profile.avatar
    : profile.avatar
    ? `http://localhost:5000/${profile.avatar.replace(/\\/g, '/')}`
    : '/default-avatar.jpg';

  // ✅ תאריך הצטרפות
  const joinedDate = profile.joinDate
    ? new Date(profile.joinDate).toLocaleDateString()
    : 'Unknown';

  // ✅ חילוץ קישורים חברתיים
  const { twitter, instagram, deviantart } = profile.socialLinks || {};

  // ✅ פונקציה לוודא שיש https
  const formatLink = (url) => {
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `https://${url}`;
  };

  return (
    <div className="text-center">
      <h2>{profile.username ? `${profile.username}'s Profile` : 'User Profile'}</h2>

      <img
        src={avatarUrl}
        alt={`${profile.username || 'User'} avatar`}
        className="rounded-circle mb-3"
        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
      />

      <p><strong>Email:</strong> {profile.email || 'N/A'}</p>
      <p><strong>Bio:</strong> {profile.bio?.trim() || 'Not provided'}</p>
      <p><strong>Location:</strong> {profile.location || 'Unknown'}</p>
      <p><strong>Favorite Genres:</strong> {profile.favoriteGenres?.join(', ') || 'None'}</p>

      {/* ✅ קישורים חברתיים */}
      {twitter?.trim() && (
        <p>
          <strong>Twitter:</strong>{' '}
          <a href={formatLink(twitter)} target="_blank" rel="noopener noreferrer">
            {twitter}
          </a>
        </p>
      )}

      {instagram?.trim() && (
        <p>
          <strong>Instagram:</strong>{' '}
          <a href={formatLink(instagram)} target="_blank" rel="noopener noreferrer">
            {instagram}
          </a>
        </p>
      )}

      {deviantart?.trim() && (
        <p>
          <strong>DeviantArt:</strong>{' '}
          <a href={formatLink(deviantart)} target="_blank" rel="noopener noreferrer">
            {deviantart}
          </a>
        </p>
      )}

      <p><strong>Joined:</strong> {joinedDate}</p>

      <Button variant="primary" onClick={onEdit}>
        Edit Profile
      </Button>
    </div>
  );
};

export default ProfileHeader;
