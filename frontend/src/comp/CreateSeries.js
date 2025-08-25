// src/comp/CreateSeries.js
import React, { useRef, useState } from 'react';
import { useUser } from '../context/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';

const CreateSeries = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleCoverImageChange = (e) => {
    setCoverImage(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!user?._id) {
      setError('יש להתחבר כדי ליצור סדרה.');
      navigate('/login', { replace: true });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      if (coverImage) formData.append('coverImage', coverImage); // ← multer.fields: 'coverImage'

      // ה־JWT יצורף אוטומטית דרך api interceptor
      const { data } = await api.post('/api/series', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('הסדרה נוצרה בהצלחה!');
      setError('');
      setName('');
      setDescription('');
      setCoverImage(null);
      if (fileRef.current) fileRef.current.value = ''; // איפוס קלט קובץ

      // אם השרת מחזיר _id, אפשר לנווט לעמוד הסדרה:
      // if (data?._id) navigate(`/series/${data._id}`);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
        return;
      }
      console.error('❌ שגיאה ביצירת סדרה:', err?.response?.data || err);
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'שגיאה ביצירת סדרה. אנא נסה שוב.'
      );
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
            ref={fileRef}
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
