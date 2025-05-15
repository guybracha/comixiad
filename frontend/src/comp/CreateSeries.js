import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

const CreateSeries = () => {
  const { user } = useUser();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const handleCoverImageChange = (e) => {
    setCoverImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!user?._id) {
    setError('You must be logged in to create a series.');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('coverImage', coverImage);
    formData.append('author', user._id); // רק אם השרת מצפה לזה – אם לא, תסיר

    const token = localStorage.getItem('token');

    const response = await axios.post('http://localhost:5000/api/series', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });

    setMessage('Series created successfully!');
    setError('');
  } catch (err) {
    console.error('❌ Failed to create series:', err);
    setError('Failed to create series. Please try again.');
    setMessage('');
  }
};


  return (
    <div className="container py-5">
      <h2>צור סדרה</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">שם</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">תיאור</label>
          <textarea
            className="form-control"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">תמונת שער</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleCoverImageChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">צור סדרה</button>
        <Link to="/upload" className="btn btn-secondary ms-2">העלה קומיקס</Link>
      </form>
    </div>
  );
};

export default CreateSeries;