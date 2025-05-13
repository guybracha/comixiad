import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ProfileHeader from './Profile/ProfileHeader';
import CreatedComicList from './Profile/CreatedComicList';
import CreatedSeriesList from './Profile/CreatedSeriesList';
import EditProfileModal from './Profile/EditProfileModal';

const UserProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState({});
  const [userComics, setUserComics] = useState([]);
  const [userSeries, setUserSeries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [currentUser, setCurrentUser] = useState({});

useEffect(() => {
  if (!id) return;

  fetchUserProfile();

  const token = localStorage.getItem('token');
  console.log('📦 Token from localStorage:', token);

  if (token) {
    fetchCurrentUser();
  } else {
    console.warn('⚠️ No token found in localStorage');
  }
}, [id]);


  const fetchUserProfile = async () => {
    try {
      const { data } = await axios.get(`/api/users/${id}`);
      setProfile(data);
      setFormData({
        username: data.username || '',
        email: data.email || '',
        bio: data.bio || '',
        location: data.location || '',
        favoriteGenres: data.favoriteGenres || [],
        socialLinks: data.socialLinks || {},
      });
      fetchUserComics(data._id);
      fetchUserSeries(data._id);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

const fetchCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    console.log('➡️ Sending token to server:', token);

    const { data } = await axios.get('/api/users/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    setCurrentUser(data);
  } catch (error) {
    console.error('❌ Error fetching current user:', error.response?.data || error.message);
  }
};



  const fetchUserComics = async (userId) => {
  try {
    const { data } = await axios.get(`/api/comics?author=${userId}`);
    setUserComics(data);
  } catch (error) {
    console.error('Error fetching user comics:', error);
  }
};


  const fetchUserSeries = async (userId) => {
    try {
      const { data } = await axios.get(`/api/series?author=${userId}`);
      setUserSeries(data);
    } catch (error) {
      console.error('Error fetching user series:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // עבור שדות מקוננים (כמו socialLinks.twitter)
    if (name.startsWith('socialLinks.')) {
      const socialKey = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value,
        },
      }));
    } else if (name === 'favoriteGenres') {
      setFormData((prev) => ({
        ...prev,
        favoriteGenres: value.split(',').map((g) => g.trim()),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setAvatarFile(e.target.files[0]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const form = new FormData();
      for (let key in formData) {
        if (key === 'socialLinks' || key === 'favoriteGenres') {
          form.append(key, JSON.stringify(formData[key]));
        } else {
          form.append(key, formData[key]);
        }
      }
      if (avatarFile) {
        form.append('avatar', avatarFile);
      }

      await axios.put(`/api/users/${id}`, form);
      fetchUserProfile();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleDeleteComic = async (comicId) => {
    try {
      await axios.delete(`/api/comics/${comicId}`);
      fetchUserComics(profile._id);
    } catch (error) {
      console.error('Error deleting comic:', error);
    }
  };

const handleDeleteSeries = async (seriesId) => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5000/api/series/${seriesId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    setUserSeries(prev => prev.filter(s => s._id !== seriesId));
  } catch (error) {
    console.error('Error deleting series:', error);
  }
};


  return (
    <div className="container mt-4">
      {profile.username ? (
        <ProfileHeader profile={profile} onEdit={() => setShowModal(true)} />
      ) : (
        <div className="text-center">Loading profile...</div>
      )}
      <hr />
      <CreatedComicList comics={userComics} currentUserId={currentUser._id} onDelete={handleDeleteComic} />
      <hr />
      <CreatedSeriesList series={userSeries} currentUserId={currentUser._id} onDelete={handleDeleteSeries} />
      <EditProfileModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSubmit={handleFormSubmit}
        formData={formData}
        onChange={handleInputChange}
        onFileChange={handleFileChange}
      />
    </div>
  );
};

export default UserProfile;
