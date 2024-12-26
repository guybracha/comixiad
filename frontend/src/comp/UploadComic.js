import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import genres from '../config/Genres';
import { useUser } from '../context/UserContext';

const UploadComic = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // בדוק אם המשתמש מחובר
  useEffect(() => {
    if (!user) {
      alert('אנא התחבר כדי להעלות קומיקס.');
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('genre', genre);
      formData.append('language', language);
      formData.append('coverImage', coverImage);
      pages.forEach((page, index) => {
        formData.append(`pages[${index}]`, page);
      });

      const response = await axios.post('http://localhost:5000/api/comics', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.status === 201) {
        navigate(`/comics/${response.data.id}`);
      } else {
        setError('Failed to upload comic.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
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
            placeholder="Title"
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
            placeholder="Description"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="genre" className="form-label">Genre</label>
          <select
            className="form-select"
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            required
          >
            <option value="">Select Genre</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="language" className="form-label">Language</label>
          <input
            type="text"
            className="form-control"
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="Language"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="coverImage" className="form-label">Cover Image</label>
          <input
            type="file"
            className="form-control"
            id="coverImage"
            onChange={(e) => setCoverImage(e.target.files[0])}
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
            required
          />
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