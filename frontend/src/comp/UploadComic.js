import React, { useState } from 'react';
import axios from 'axios';
import genres from '../config/Genres'; // עדכן את הנתיב לקובץ genres.js

const UploadComic = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [author, setAuthor] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setPages(e.target.files);
  };

  const handleCoverImageChange = (e) => {
    setCoverImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('genre', genre);
    formData.append('language', language);
    formData.append('author', author);

    if (coverImage) {
      formData.append('coverImage', coverImage);
    }

    for (let i = 0; i < pages.length; i++) {
      formData.append('pages', pages[i]);
    }

    try {
      const response = await axios.post('/api/comics/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Comic uploaded successfully!');
      setTitle('');
      setDescription('');
      setGenre('');
      setLanguage('');
      setAuthor('');
      setCoverImage(null);
      setPages([]);
    } catch (error) {
      console.error(error);
      alert('Error uploading comic.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="container mt-4">
      <h2>העלה קומיקס</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label>שם</label>
        <input
          type="text"
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label>תקציר</label>
        <textarea
          className="form-control"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
      </div>

      <div className="mb-3">
        <label>ז'אנר</label>
        <select
          className="form-select"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          required
        >
          <option value="" disabled>
            בחר ז'אנר
          </option>
          {genres.map((genreOption) => (
            <option key={genreOption} value={genreOption}>
              {genreOption}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label>שפה</label>
        <input
          type="text"
          className="form-control"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label>מחבר</label>
        <input
          type="text"
          className="form-control"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label>תמונת קאבר</label>
        <input
          type="file"
          className="form-control"
          onChange={handleCoverImageChange}
          required
        />
      </div>

      <div className="mb-3">
        <label>עמודים (תמונות בלבד)</label>
        <input
          type="file"
          className="form-control"
          multiple
          onChange={handleFileChange}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'מעלה...' : 'העלה קומיקס'}
      </button>
    </form>
  );
};

export default UploadComic;
