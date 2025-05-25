import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import languages from '../config/Languages';
import genres from '../config/Genres';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../Config';

const UploadComic = () => {
  const { user } = useUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('');
  const [genre, setGenre] = useState('');
  const [pages, setPages] = useState([]);
  const [series, setSeries] = useState('');
  const [allSeries, setAllSeries] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // ✅ הגנה על הדף – הצגה רק למשתמשים מחוברים
  useEffect(() => {
if (!user?._id) {
  return (
    <div className="container py-5 text-center">
      <div className="alert alert-warning">
        🛑 עליך <Link to="/login">להתחבר</Link> כדי להעלות קומיקס.
      </div>
    </div>
  );
}
  const fetchSeries = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/series`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const userSeries = response.data.filter((s) => s.author === user._id);
      setAllSeries(userSeries);
    } catch (err) {
      console.error('Failed to fetch series:', err);
    }
  };

  fetchSeries();
}, [user?._id]);


  const handlePagesChange = (e) => {
    setPages(Array.from(e.target.files));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('language', language);
      formData.append('genre', genre);
      formData.append('author', user._id); // רק אם נדרש בשרת
      if (series) formData.append('series', series);
      pages.forEach(file => formData.append('pages', file));

      const response = await axios.post(
        `${API_BASE_URL}/api/comics/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setMessage('Comic uploaded successfully!');
      setTitle('');
      setDescription('');
      setLanguage('');
      setGenre('');
      setSeries('');
      setPages([]);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please try again.');
    }
  };

  return (
    <div className="container py-5">
      <h2>העלה קומיקס</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">שם קומיקס</label>
          <input
            type="text"
            className="form-control"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">תיאור</label>
          <textarea
            className="form-control"
            id="description"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="language" className="form-label">שפה</label>
          <select
            className="form-select"
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            required
          >
            <option value="">בחר שפה</option>
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.emoji} {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="genre" className="form-label">ז'אנר</label>
          <select
            className="form-select"
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            required
          >
            <option value="">בחר ז'אנר</option>
            {genres.map((gen) => (
              <option key={gen.id} value={gen.id}>
                {gen.emoji} {gen.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="pages" className="form-label">עמודים</label>
          <input
            type="file"
            className="form-control"
            id="pages"
            multiple
            onChange={handlePagesChange}
            accept="image/*"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="series" className="form-label">סדרה (אופציה)</label>
          <select
            className="form-select"
            id="series"
            value={series}
            onChange={(e) => setSeries(e.target.value)}
          >
            <option value="">בחר סדרה</option>
            {allSeries.map((seriesItem) => (
              <option key={seriesItem._id} value={seriesItem._id}>
                {seriesItem.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary">העלה קומיקס</button>
        <Link to="/CreateSeries" className="btn btn-secondary ms-2">צור סדרה</Link>
      </form>
    </div>
  );
};

export default UploadComic;
