import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../Config';

const CreateSeries = () => {
  const { user } = useUser();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleCoverImageChange = (e) => {
    setCoverImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?._id) {
      setError('יש להתחבר כדי ליצור סדרה.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      if (coverImage) formData.append('coverImage', coverImage);

      const response = await axios.post(`${API_BASE_URL}/api/series`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setMessage('הסדרה נוצרה בהצלחה!');
      setError('');
      setName('');
      setDescription('');
      setCoverImage(null);
    } catch (err) {
      console.error('❌ שגיאה ביצירת סדרה:', err);
      setError('שגיאה ביצירת סדרה. אנא נסה שוב.');
      setMessage('');
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">צור סדרה</h2>
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
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">תיאור</label>
          <textarea
            className="form-control"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
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
