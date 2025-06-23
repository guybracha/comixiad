// src/comp/UserProfile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import ProfileHeader from './Profile/ProfileHeader';
import CreatedComicList from './Profile/CreatedComicList';
import CreatedSeriesList from './Profile/CreatedSeriesList';
import EditProfileModal from './Profile/EditProfileModal';

import { API_BASE_URL } from '../Config';
import '../UserProfile.css';

function UserProfile() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();

  const [profile, setProfile] = useState({});
  const [userComics, setUserComics] = useState([]);
  const [userSeries, setUserSeries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [currentUser, setCurrentUser] = useState({});

  const isCurrentUser = currentUser?._id === id;

  /* -------------------------------------------------- */
  /*                 LOADERS                            */
  /* -------------------------------------------------- */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/users/${id}`);
        setProfile(data);
        setFormData({
          username: data.username || '',
          email: data.email || '',
          bio: data.bio || '',
          location: data.location || '',
          favoriteGenres: (data.favoriteGenres || []).join(', '),
          socialLinks: {
            twitter: data.socialLinks?.twitter || '',
            instagram: data.socialLinks?.instagram || '',
            deviantart: data.socialLinks?.deviantart || ''
          }
        });
      } catch (err) {
        console.error(err);
      }
    };

    const loadCurrentUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadProfile();
    loadCurrentUser();
  }, [id]);

  useEffect(() => {
    if (profile._id) {
      fetchUserComics(profile._id);
      fetchUserSeries(profile._id);
    }
  }, [profile._id]);

  const fetchUserComics = async (userId) => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/comics?author=${userId}`
      );
      setUserComics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserSeries = async (userId) => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/series?author=${userId}`
      );
      setUserSeries(data);
    } catch (err) {
      console.error(err);
    }
  };

  /* -------------------------------------------------- */
  /*                 HANDLERS                           */
  /* -------------------------------------------------- */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('socialLinks.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [key]: value }
      }));
    } else if (name === 'favoriteGenres') {
      setFormData((prev) => ({
        ...prev,
        favoriteGenres: value.split(',').map((g) => g.trim())
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDeleteComic = async (comicId) => {
    if (!window.confirm(t('profile.confirmDeleteComic'))) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/comics/${comicId}`);
      setUserComics((prev) => prev.filter((c) => c._id !== comicId));
    } catch (err) {
      console.error(err);
      alert(t('profile.errorDelete'));
    }
  };

  const handleDeleteSeries = async (seriesId) => {
    if (!window.confirm(t('profile.confirmDeleteSeries'))) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/series/${seriesId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUserSeries((prev) => prev.filter((s) => s._id !== seriesId));
    } catch (err) {
      console.error(err);
      alert(t('profile.errorDelete'));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([k, v]) =>
        form.append(k, typeof v === 'string' ? v : JSON.stringify(v))
      );
      if (avatarFile) form.append('avatar', avatarFile);

      await axios.put(`${API_BASE_URL}/api/users/${profile._id}`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setShowModal(false);
      const updated = await axios.get(
        `${API_BASE_URL}/api/users/${profile._id}`
      );
      setProfile(updated.data);
    } catch (err) {
      console.error(err);
    }
  };

  /* -------------------------------------------------- */
  /*                 RENDER                             */
  /* -------------------------------------------------- */
  if (!profile.username)
    return <div className="profile-loading">🔄 {t('profile.loading')}</div>;

  return (
    <div className="user-profile-container">
      <ProfileHeader
        profile={profile}
        onEdit={isCurrentUser ? () => setShowModal(true) : null}
      />

      <hr />
      <h3 className="section-title">📚 {t('profile.postedComics')}</h3>
      <CreatedComicList
        comics={userComics}
        currentUserId={profile._id}
        loggedInUserId={currentUser._id}
        onDelete={handleDeleteComic}
      />

      <hr />
      <h3 className="section-title">🎞️ {t('profile.createdSeries')}</h3>
      <CreatedSeriesList
        series={userSeries}
        currentUserId={profile._id}
        loggedInUserId={currentUser._id}
        onDelete={isCurrentUser ? handleDeleteSeries : null}
      />

      {isCurrentUser && (
        <EditProfileModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onSubmit={handleFormSubmit}
          formData={formData}
          onChange={handleInputChange}
          onFileChange={(e) => setAvatarFile(e.target.files[0])}
        />
      )}
    </div>
  );
}

export default UserProfile;
