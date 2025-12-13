// src/comp/UserProfile.js
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import ProfileHeader from './Profile/ProfileHeader';
import CreatedComicList from './Profile/CreatedComicList';
import CreatedSeriesList from './Profile/CreatedSeriesList';
import FavoriteComicsList from './Profile/FavoriteComicsList';
import EditProfileModal from './Profile/EditProfileModal';

import { API_BASE_URL } from '../Config';
import '../UserProfile.css';

function UserProfile() {
  const { t } = useTranslation();
  const { id } = useParams(); // פרופיל לפי URL

  const [profile, setProfile] = useState({});
  const [userComics, setUserComics] = useState([]);
  const [userSeries, setUserSeries] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [okMsg, setOkMsg] = useState('');

  const token = useMemo(() => localStorage.getItem('token') || '', []);

  // האם המשתמש המחובר הוא בעל הפרופיל
  const isCurrentUser = Boolean(currentUser?._id && profile?._id && currentUser._id === profile._id);

  /* ---------------------------------- LOADERS ---------------------------------- */
  useEffect(() => {
    // טען פרופיל (ציבורי)
    const loadProfile = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/users/${id}`);
        setProfile(data);
        setFormData({
          username: data.username || '',
          email: data.email || '',
          bio: data.bio || '',
          location: data.location || '',
          favoriteGenres: Array.isArray(data.favoriteGenres) ? data.favoriteGenres.join(', ') : '',
          socialLinks: {
            twitter: data.socialLinks?.twitter || '',
            instagram: data.socialLinks?.instagram || '',
            deviantart: data.socialLinks?.deviantart || ''
          }
        });
      } catch (err) {
        console.error('loadProfile failed:', err);
      }
    };

    // טען משתמש מחובר לפי ה־token
    const loadCurrentUser = async () => {
      if (!token) return;
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentUser(data);
      } catch (err) {
        console.error('loadCurrentUser failed:', err);
      }
    };

    loadProfile();
    loadCurrentUser();
  }, [id, token]);

  useEffect(() => {
    if (profile._id) {
      fetchUserComics(profile._id);
      fetchUserSeries(profile._id);
    }
  }, [profile._id]);

  const fetchUserComics = async (userId) => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/comics?author=${userId}`);
      const normalized = (Array.isArray(data) ? data : []).map(c => {
        const firstPage = Array.isArray(c.pages) && c.pages.length ? c.pages[0].url : '';
        return {
          ...c,
          title: c.title || 'Untitled',
          coverImage: firstPage || ''
        };
      });
      setUserComics(normalized);
    } catch (err) {
      console.error('fetchUserComics failed:', err);
      setUserComics([]);
    }
  };

  const fetchUserSeries = async (userId) => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/series?author=${userId}`);
      const normalized = (Array.isArray(data) ? data : []).map(s => ({
        ...s,
        title: s.title || s.name || 'Untitled',
        coverImage: s.coverImage || '',
      }));
      setUserSeries(normalized);
    } catch (err) {
      console.error('fetchUserSeries failed:', err);
      setUserSeries([]);
    }
  };

  /* ---------------------------------- HANDLERS --------------------------------- */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('socialLinks.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: value } }));
    } else if (name === 'favoriteGenres') {
      setFormData(prev => ({ ...prev, favoriteGenres: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDeleteComic = async (comicId) => {
    if (!window.confirm(t('profile.confirmDeleteComic'))) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/comics/${comicId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserComics(prev => prev.filter(c => c._id !== comicId));
    } catch (err) {
      console.error(err);
      alert(t('profile.errorDelete'));
    }
  };

  const handleDeleteSeries = async (seriesId) => {
    if (!window.confirm(t('profile.confirmDeleteSeries'))) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/series/${seriesId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserSeries(prev => prev.filter(s => s._id !== seriesId));
    } catch (err) {
      console.error(err);
      alert(t('profile.errorDelete'));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrMsg('');
    setOkMsg('');

    // הגנה בצד לקוח: רק בעל הפרופיל רשאי לערוך
    if (!isCurrentUser) {
      setErrMsg(t('profile.notAuthorized'));
      return;
    }
    if (!token) {
      setErrMsg(t('profile.missingToken') || 'Missing token');
      return;
    }

    try {
      setSaving(true);

      // המרה מסודרת לעדכון
      const genresArr = String(formData.favoriteGenres || '')
        .split(',')
        .map(g => g.trim())
        .filter(Boolean);

      const payload = new FormData();
      payload.append('username', formData.username || '');
      payload.append('email', formData.email || '');
      payload.append('bio', formData.bio || '');
      payload.append('location', formData.location || '');
      payload.append('favoriteGenres', JSON.stringify(genresArr));
      payload.append('socialLinks', JSON.stringify(formData.socialLinks || {}));
      if (avatarFile) payload.append('avatar', avatarFile);

      // אם יש אצלך ראוט נוח /me השתמש בו; אם לא – לפי ה־_id של המשתמש המחובר.
      const updateUrlMe = `${API_BASE_URL}/api/users/me`;
      const updateUrlById = `${API_BASE_URL}/api/users/${currentUser._id}`;

      // ננסה קודם /me (אם קיים יחזיר 200); אם לא — נלך לפי id
      let res;
      try {
        res = await axios.put(updateUrlMe, payload, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      } catch {
        res = await axios.put(updateUrlById, payload, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res?.status >= 200 && res?.status < 300) {
        setShowModal(false);
        setOkMsg(t('profile.updated') || 'Profile updated!');
        // טען שוב את הפרופיל מעודכן
        const { data } = await axios.get(`${API_BASE_URL}/api/users/${profile._id}`);
        setProfile(data);
      } else {
        setErrMsg(t('profile.updateFailed') || 'Update failed');
      }
    } catch (err) {
      console.error('handleFormSubmit failed:', err);
      setErrMsg(err?.response?.data?.error || t('profile.updateFailed') || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------------------- RENDER ---------------------------------- */
  if (!profile.username) {
    return <div className="profile-loading">🔄 {t('profile.loading')}</div>;
  }

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
        loggedInUserId={currentUser?._id}
        onDelete={handleDeleteComic}
      />

      <hr />
      <h3 className="section-title">🎞️ {t('profile.createdSeries')}</h3>
      <CreatedSeriesList
        series={userSeries}
        profileUserId={profile._id}
        loggedInUserId={currentUser?._id}
        onDelete={isCurrentUser ? handleDeleteSeries : null}
      />

      {/* Favorite Comics Section */}
      <div className="favorite-section mt-5">
        <FavoriteComicsList userId={profile._id} />
      </div>

      {isCurrentUser && (
        <EditProfileModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onSubmit={handleFormSubmit}
          formData={formData}
          onChange={handleInputChange}
          onFileChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
          successMessage={okMsg}
          errorMessage={errMsg}
        />
      )}

      {!isCurrentUser && (
        <div className="alert alert-info mt-3">
          {t('profile.viewOnly') || 'This profile is view-only.'}
        </div>
      )}

      {saving && <div className="mt-2 small text-muted">{t('profile.saving') || 'Saving…'}</div>}
    </div>
  );
}

export default UserProfile;
