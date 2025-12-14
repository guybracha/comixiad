import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import genres from '../config/Genres';
import languages from '../config/Languages';
import { API_BASE_URL } from '../Config';
import '../UploadComic.css';

const EditComic = () => {
  const { comicId } = useParams();
  const navigate = useNavigate();
  const [comic, setComic] = useState(null);
  const [userSeries, setUserSeries] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: '',
    genre: '',
    series: '' // ← חדש: שיוך לסדרה
  });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState([]);
  const [pagePreviews, setPagePreviews] = useState([]);
  const [newPages, setNewPages] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);

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
          series: fetchedComic.series || ''
        });
        
        // טעינת עמודים קיימים
        if (fetchedComic.pages && fetchedComic.pages.length > 0) {
          setPages(fetchedComic.pages);
          const previews = fetchedComic.pages.map(page => {
            const url = page.url || page.path || page.filename;
            return url ? `${API_BASE_URL}/${url.replace(/\\/g, '/')}` : '/images/placeholder.jpg';
          });
          setPagePreviews(previews);
        }
      } catch (err) {
        console.error('Error fetching comic:', err);
        setError('Failed to fetch comic.');
      } finally {
        setLoading(false);
      }
    };

    fetchComic();
  }, [comicId, user._id, navigate]);

  useEffect(() => {
    const fetchUserSeries = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/series?author=${user._id}`);
        setUserSeries(response.data);
      } catch (err) {
        console.error('Error fetching user series:', err);
      }
    };

    if (user._id) {
      fetchUserSeries();
    }
  }, [user._id]);


  // ניקוי URLs כשהקומפוננטה מתפרקת
  useEffect(() => {
    return () => {
      pagePreviews.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [pagePreviews]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewPagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setNewPages(files);
    
    // יצירת תצוגה מקדימה
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPagePreviews([...pagePreviews, ...newPreviews]);
    setPages([...pages, ...files.map((f, idx) => ({ filename: f.name, new: true, file: f }))]);
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newPages = [...pages];
    const newPreviews = [...pagePreviews];
    
    const draggedPage = newPages[draggedIndex];
    const draggedPreview = newPreviews[draggedIndex];
    
    newPages.splice(draggedIndex, 1);
    newPages.splice(dropIndex, 0, draggedPage);
    
    newPreviews.splice(draggedIndex, 1);
    newPreviews.splice(dropIndex, 0, draggedPreview);
    
    setPages(newPages);
    setPagePreviews(newPreviews);
    setDraggedIndex(null);
  };

  const handleRemovePage = (index) => {
    const newPages = pages.filter((_, i) => i !== index);
    const newPreviews = pagePreviews.filter((_, i) => i !== index);
    
    if (pagePreviews[index]?.startsWith('blob:')) {
      URL.revokeObjectURL(pagePreviews[index]);
    }
    
    setPages(newPages);
    setPagePreviews(newPreviews);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleConfirmUpdate = async () => {
    setShowModal(false);
    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('language', formData.language);
      form.append('genre', formData.genre);
      if (formData.series) form.append('series', formData.series);
      
      // שליחת סדר העמודים
      form.append('pageOrder', JSON.stringify(pages.map(p => p._id || p.filename)));
      
      // הוספת עמודים חדשים
      pages.forEach((page) => {
        if (page.new && page.file) {
          form.append('newPages', page.file);
        }
      });

      await axios.put(`${API_BASE_URL}/api/comics/${comicId}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
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

        <div className="mb-3">
          <label htmlFor="series" className="form-label">Series (Optional)</label>
          <select
            className="form-select"
            id="series"
            name="series"
            value={formData.series}
            onChange={handleInputChange}
          >
            <option value="">Standalone Comic</option>
            {userSeries.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* תצוגה מקדימה של עמודים קיימים */}
        {pagePreviews.length > 0 && (
          <div className="mb-4">
            <h5>Pages ({pages.length} pages)</h5>
            <div className="pages-preview-grid">
              {pagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className={`page-preview-item ${draggedIndex === index ? 'dragging' : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                >
                  <div className="page-number">#{index + 1}</div>
                  <img src={preview} alt={`Page ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-page-btn"
                    onClick={() => handleRemovePage(index)}
                    title="Remove page"
                  >
                    ✕
                  </button>
                  <div className="drag-handle">⋮⋮</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* הוספת עמודים חדשים */}
        <div className="mb-3">
          <label htmlFor="newPages" className="form-label">Add New Pages (Optional)</label>
          <input
            id="newPages"
            type="file"
            className="form-control"
            multiple
            accept="image/*"
            onChange={handleNewPagesChange}
          />
          <div className="form-text">
            Upload additional pages. You can drag and drop to reorder all pages.
          </div>
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
