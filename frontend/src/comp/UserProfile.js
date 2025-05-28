import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ProfileHeader from './Profile/ProfileHeader';
import CreatedComicList from './Profile/CreatedComicList';
import CreatedSeriesList from './Profile/CreatedSeriesList';
import EditProfileModal from './Profile/EditProfileModal';
import { API_BASE_URL } from '../Config';
import '../UserProfile.css'; // Make sure to create this CSS file for styling

const UserProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState({});
  const [userComics, setUserComics] = useState([]);
  const [userSeries, setUserSeries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [currentUser, setCurrentUser] = useState({});

  const isCurrentUser = currentUser?._id === id;

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
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    const loadCurrentUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCurrentUser(data);
      } catch (error) {
        console.error('Error loading current user:', error);
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
      const { data } = await axios.get(`${API_BASE_URL}/api/comics?author=${userId}`);
      setUserComics(data);
    } catch (error) {
      console.error('Error fetching comics:', error);
    }
  };

  const fetchUserSeries = async (userId) => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/series?author=${userId}`);
      setUserSeries(data); // ← עכשיו זה הולך למקום הנכון
    } catch (error) {
      console.error('Error fetching series:', error);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('socialLinks.')) {
      const socialKey = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value
        }
      }));
    } else if (name === 'favoriteGenres') {
      setFormData((prev) => ({
        ...prev,
        favoriteGenres: value.split(',').map((g) => g.trim())
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

   const handleDeleteComic = async (comicId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק קומיקס זה?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/comics/${comicId}`);
      setUserComics((prev) => prev.filter((comic) => comic._id !== comicId));
    } catch (err) {
      console.error('שגיאה במחיקת קומיקס:', err);
      alert('אירעה שגיאה במחיקה');
    }
  };

  const handleDeleteSeries = async (seriesId) => {
  if (!window.confirm('האם אתה בטוח שברצונך למחוק את הסדרה?')) return;

  try {
    await axios.delete(`${API_BASE_URL}/api/series/${seriesId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    setUserSeries((prev) => prev.filter((s) => s._id !== seriesId));
  } catch (err) {
    console.error('שגיאה במחיקת סדרה:', err);
    alert('אירעה שגיאה בעת המחיקה');
  }
};


  const handleFileChange = (e) => {
    setAvatarFile(e.target.files[0]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append('username', formData.username);
      form.append('email', formData.email);
      form.append('bio', formData.bio);
      form.append('location', formData.location);
      form.append('favoriteGenres', JSON.stringify(formData.favoriteGenres));
      form.append('socialLinks', JSON.stringify(formData.socialLinks));
      if (avatarFile) {
        form.append('avatar', avatarFile);
      }

      await axios.put(`${API_BASE_URL}/api/users/${profile._id}`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setShowModal(false);
      const updated = await axios.get(`${API_BASE_URL}/api/users/${profile._id}`);
      setProfile(updated.data);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
  <div className="user-profile-container">
    {!profile.username ? (
      <div className="profile-loading">🔄 טוען פרופיל...</div>
    ) : (
      <>
        <ProfileHeader
          profile={profile}
          onEdit={isCurrentUser ? () => setShowModal(true) : null}
        />
        <hr />
        <h3 className="section-title">📚 קומיקסים שפורסמו</h3>
        <CreatedComicList
          comics={userComics}
          currentUserId={profile._id}
          loggedInUserId={currentUser._id}
          onDelete={handleDeleteComic}
        />
        <hr />
        <h3 className="section-title">🎞️ סדרות שיצר</h3>
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
            onFileChange={handleFileChange}
          />
        )}
      </>
    )}
  </div>
  );
};

export default UserProfile;
