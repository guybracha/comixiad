// ProfileHeader.js
import React from 'react';
import { Button } from 'react-bootstrap';
import { API_BASE_URL } from '../../Config';

// helper קטן שמייצר URL ציבורי מהערך במסד
function buildAvatarUrl(raw) {
  if (!raw) return null;
  if (raw.startsWith('http')) return raw;

  // unify slashes
  let p = raw.replace(/\\/g, '/');

  // אם יש נתיב מוחלט של שרת, חילוץ החל מ-/uploads/ ואילך
  const pos = p.lastIndexOf('/uploads/');
  if (pos !== -1) {
    p = p.slice(pos + 1); // "uploads/1747....jpg"
  } else {
    // דוגמאות נפוצות: "/root/backend/uploads/..." או "backend/uploads/..."
    p = p.replace(/^\/?root\/backend\/uploads\//, 'uploads/');
    p = p.replace(/^\/?backend\/uploads\//, 'uploads/');
  }

  // לוודא שאין סלאש מוביל כפול
  p = p.replace(/^\/+/, '');

  return `${API_BASE_URL}/${p}`;
}

const ProfileHeader = ({ profile, onEdit }) => {
  const avatarUrl =
    buildAvatarUrl(profile.avatar) || 'https://www.gravatar.com/avatar/?d=mp';

  const joinedDate = profile.joinDate
    ? new Date(profile.joinDate).toLocaleDateString()
    : 'Unknown';

  const { twitter, instagram, deviantart } = profile.socialLinks || {};

  return (
    <div className="user-profile-container text-center">
      <img
        src={avatarUrl}
        alt="avatar"
        className="profile-avatar"
        onError={(e) => { e.currentTarget.src = 'https://www.gravatar.com/avatar/?d=mp'; }}
      />

      <h2 className="profile-name">
        {profile.username ? `${profile.username}'s Profile` : 'User Profile'}
      </h2>

      <div className="profile-details">
        <p className="profile-info"><span>Email:</span> {profile.email || 'N/A'}</p>
        <p className="profile-info"><span>Bio:</span> {profile.bio || 'N/A'}</p>
        <p className="profile-info"><span>Location:</span> {profile.location || 'N/A'}</p>
        <p className="profile-info">
          <span>Favorite Genres:</span>{' '}
          {Array.isArray(profile.favoriteGenres) ? profile.favoriteGenres.join(', ') : 'N/A'}
        </p>
        <p className="profile-info"><span>Joined:</span> {joinedDate}</p>
      </div>

      {(twitter || instagram || deviantart) && (
        <div className="social-links mt-3">
          {twitter && <a href={twitter} target="_blank" rel="noreferrer" className="social-link">🐦 Twitter</a>}
          {instagram && <a href={instagram} target="_blank" rel="noreferrer" className="social-link">📸 Instagram</a>}
          {deviantart && <a href={deviantart} target="_blank" rel="noreferrer" className="social-link">🎨 DeviantArt</a>}
        </div>
      )}

      {onEdit && (
        <Button className="edit-btn" onClick={onEdit}>
          Edit Profile
        </Button>
      )}
    </div>
  );
};

export default ProfileHeader;
