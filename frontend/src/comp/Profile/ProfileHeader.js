import React from 'react';
import { Button } from 'react-bootstrap';
import { API_BASE_URL } from '../../Config';

const ProfileHeader = ({ profile, onEdit }) => {
  const avatarUrl = profile.avatar?.startsWith('http')
    ? profile.avatar
    : profile.avatar
      ? `${API_BASE_URL}/${profile.avatar.replace(/\\/g, '/')}`
      : 'https://www.gravatar.com/avatar/?d=mp';

  const joinedDate = profile.joinDate
    ? new Date(profile.joinDate).toLocaleDateString()
    : 'Unknown';

  const { twitter, instagram, deviantart } = profile.socialLinks || {};

  return (
    <div className="user-profile-container text-center">
      {/* תמונת פרופיל */}
      <img
        src={avatarUrl}
        alt="avatar"
        className="profile-avatar"
        onError={(e) => { e.target.src = 'https://www.gravatar.com/avatar/?d=mp'; }}
      />

      {/* שם משתמש */}
      <h2 className="profile-name">
        {profile.username ? `${profile.username}'s Profile` : 'User Profile'}
      </h2>

      {/* פרטי מידע */}
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

      {/* קישורים חברתיים */}
      {(twitter || instagram || deviantart) && (
        <div className="social-links mt-3">
          {twitter && <a href={twitter} target="_blank" rel="noreferrer" className="social-link">🐦 Twitter</a>}
          {instagram && <a href={instagram} target="_blank" rel="noreferrer" className="social-link">📸 Instagram</a>}
          {deviantart && <a href={deviantart} target="_blank" rel="noreferrer" className="social-link">🎨 DeviantArt</a>}
        </div>
      )}

      {/* כפתור עריכה */}
      {onEdit && (
        <Button className="edit-btn" onClick={onEdit}>
          Edit Profile
        </Button>
      )}
    </div>
  );
};

export default ProfileHeader;
