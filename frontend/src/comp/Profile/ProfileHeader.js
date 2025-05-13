import React from 'react';
import { Button } from 'react-bootstrap';

const ProfileHeader = ({ profile, onEdit }) => {
    // ✔️ תיקן נתיב תמונה
    const avatarUrl = profile.avatar?.startsWith('http')
  ? profile.avatar
  : profile.avatar
    ? `http://localhost:5000/${profile.avatar.replace(/\\/g, '/')}`
    : '/default-avatar.jpg';




    // ✔️ תאריך הצטרפות (שדה: joinDate)
    const joinedDate = profile.joinDate
        ? new Date(profile.joinDate).toLocaleDateString()
        : 'Unknown';

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
            <p><strong>Bio:</strong> {profile.bio?.trim() ? profile.bio : 'Not provided'}</p>
            <p><strong>Location:</strong> {profile.location || 'Unknown'}</p>
            <p><strong>Favorite Genres:</strong> {profile.favoriteGenres?.join(', ') || 'None'}</p>

            {profile.socialLinks?.twitter && profile.socialLinks.twitter.trim() && (
                <p><strong>Twitter:</strong> <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer">{profile.socialLinks.twitter}</a></p>
            )}
            {profile.socialLinks?.instagram && (
                <p><strong>Instagram:</strong> <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer">{profile.socialLinks.instagram}</a></p>
            )}
            {profile.socialLinks?.deviantart && (
                <p><strong>DeviantArt:</strong> <a href={profile.socialLinks.deviantart} target="_blank" rel="noopener noreferrer">{profile.socialLinks.deviantart}</a></p>
            )}

            <p><strong>Joined:</strong> {joinedDate}</p>

            <Button variant="primary" onClick={onEdit}>Edit Profile</Button>
        </div>
    );
};

export default ProfileHeader;
