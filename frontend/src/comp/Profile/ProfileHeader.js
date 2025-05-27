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
    <div className="text-center">
      <h2>{profile.username ? `${profile.username}'s Profile` : 'User Profile'}</h2>

      <img
        src={avatarUrl}
        alt="avatar"
        className="rounded-circle mb-3"
        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
        onError={(e) => { e.target.src = 'https://www.gravatar.com/avatar/?d=mp'; }}
      />

      <p><strong>Email:</strong> {profile.email || 'N/A'}</p>
      <p><strong>Bio:</strong> {profile.bio || 'N/A'}</p>
      <p><strong>Location:</strong> {profile.location || 'N/A'}</p>
      <p><strong>Favorite Genres:</strong> {Array.isArray(profile.favoriteGenres) ? profile.favoriteGenres.join(', ') : 'N/A'}</p>
      <p><strong>Joined:</strong> {joinedDate}</p>

      {onEdit && (
        <Button variant="primary" onClick={onEdit}>Edit Profile</Button>
      )}
    </div>
  );
};

export default ProfileHeader;
