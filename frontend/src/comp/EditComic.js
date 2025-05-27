import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import genres from '../config/Genres';
import languages from '../config/Languages';
import { API_BASE_URL } from '../Config';

const EditComic = () => {
  const { comicId } = useParams();
  const navigate = useNavigate();
  const [comic, setComic] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: '',
    genre: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchComic = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/comics/${comicId}`);
        const fetchedComic = response.data;

        const authorId = typeof fetchedComic.author === 'string'
          ? fetchedComic.author
          : fetchedComic.author?._id;

        if (authorId !== user._id) {
          setError('You are not authorized to edit this comic.');
          return navigate('/');
        }

        setComic(fetchedComic);
        setFormData({
          title: fetchedComic.title,
          description: fetchedComic.description,
          language: fetchedComic.language,
          genre: fetchedComic.genre,
        });
      } catch (err) {
        console.error('Error fetching comic:', err);
        setError('Failed to fetch comic.');
      } finally {
        setLoading(false);
      }
    };

    fetchComic();
  }, [comicId, user._id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleConfirmUpdate = async () => {
    setShowModal(false);
    try {
      await axios.put(`${API_BASE_URL}/api/comics/${comicId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage('Comic updated successfully!');
      setTimeout(() => {
        navigate(`/profile/${user._id}`);
      }, 1200);
    } catch (err) {
      console.error('Error updating comic:', err);
      setError(`Failed to update comic: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2>Edit Comic</h2>

      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      <form onSubmit={handleFormSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="language" className="form-label">Language</label>
          <select
            className="form-select"
            id="language"
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Language</option>
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.emoji} {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="genre" className="form-label">Genre</label>
          <select
            className="form-select"
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Genre</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.emoji} {genre.label}
              </option>
            ))}
          </select>
        </div>

        <div className="d-flex justify-content-start gap-2">
          <button type="submit" className="btn btn-primary">Save Changes</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(`/profile/${user._id}`)}>Cancel</button>
        </div>
      </form>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Update</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to update this comic?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirmUpdate}>Confirm</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EditComic;
