import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';

const UploadComic = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [series, setSeries] = useState(''); // סדרה נבחרת
  const [pages, setPages] = useState([]);
  const [userSeries, setUserSeries] = useState([]); // רשימת סדרות
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserSeries = async () => {
      if (!user?._id) return;
      try {
        const response = await axios.get(`http://localhost:5000/api/series?author=${user._id}`);
        setUserSeries(response.data);
      } catch (err) {
        console.error('Failed to fetch series:', err);
      }
    };
    fetchUserSeries();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?._id) {
      setError('Please log in to upload comics');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('genre', genre);
      formData.append('language', language);
      formData.append('author', user._id);
      formData.append('series', series || null);

      Array.from(pages).forEach(file => {
        formData.append('pages', file);
      });

      const response = await axios.post(
        'http://localhost:5000/api/comics/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Upload success:', response.data);
      navigate('/comics');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload comic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Upload Comic</h2>
      <form onSubmit={handleSubmit}>
      <div className="mb-3">
          <label htmlFor="title" className="form-label">Title</label>
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
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="genre" className="form-label">Genre</label>
          <input
            type="text"
            className="form-control"
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="language" className="form-label">Language</label>
          <input
            type="text"
            className="form-control"
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="pages" className="form-label">Pages</label>
          <input
            type="file"
            className="form-control"
            id="pages"
            multiple
            onChange={(e) => setPages(Array.from(e.target.files))}
            accept="image/*"
            required
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label htmlFor="series" className="form-label">Series (optional)</label>
          <select
            className="form-select"
            id="series"
            value={series}
            onChange={(e) => setSeries(e.target.value)}
          >
            <option value="">No series</option>
            {userSeries.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Comic'}
        </button>
      </form>
    </div>
  );
};

export default UploadComic;
