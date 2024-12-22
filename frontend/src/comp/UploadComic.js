import React, { useState } from 'react';
import axios from 'axios';

const UploadComic = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [pages, setPages] = useState([]);

  const handleFileChange = (e) => {
    setPages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('genre', genre);
    formData.append('language', language);
  
    for (let i = 0; i < pages.length; i++) {
      formData.append('pages', pages[i]);
    }
  
    try {
      const response = await axios.post('http://localhost:5000/api/comics/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Comic uploaded successfully!');
    } catch (error) {
      console.error('Error:', error.response || error.message);
      alert('Failed to upload comic.');
    }
  };
  

  return (
    <form onSubmit={handleSubmit} className="container mt-4">
      <h2>Upload a Comic</h2>
      <div className="mb-3">
        <label>Title</label>
        <input
          type="text"
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label>Description</label>
        <textarea
          className="form-control"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
      </div>
      <div className="mb-3">
        <label>Genre</label>
        <input
          type="text"
          className="form-control"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label>Language</label>
        <input
          type="text"
          className="form-control"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label>Pages</label>
        <input
          type="file"
          className="form-control"
          multiple
          onChange={handleFileChange}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">Upload Comic</button>
    </form>
  );
};

export default UploadComic;
