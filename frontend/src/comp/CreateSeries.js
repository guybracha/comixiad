import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import axios from 'axios';

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
      setError('You must be logged in to create a series.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('coverImage', coverImage);
      formData.append('author', user._id);

      const response = await axios.post('http://localhost:5000/api/series', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage('Series created successfully!');
      setError('');
    } catch (err) {
      setError('Failed to create series. Please try again.');
      setMessage('');
    }
  };

  return (
    <div className="container py-5">
      <h2>Create Series</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Cover Image</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleCoverImageChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">Create Series</button>
      </form>
    </div>
  );
};

export default CreateSeries;