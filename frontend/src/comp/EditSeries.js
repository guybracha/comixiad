// src/comp/EditSeries.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../Config';
import { Button, Modal, Form } from 'react-bootstrap';

const normalizeUploadUrl = (u) => {
  if (!u) return '';
  let cleaned = String(u).replace(/\\/g, '/').trim().replace(/^\/+/, '');
  if (!cleaned.startsWith('uploads/')) cleaned = `uploads/${cleaned}`;
  return `${API_BASE_URL}/${cleaned}`;
};

const EditSeries = () => {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coverImage: null,
  });
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/series/${seriesId}`);
        const s = res.data;

        const authorId = typeof s.author === 'string' ? s.author : s.author?._id;
        if (authorId !== user._id) {
          setError('You are not authorized to edit this series.');
          navigate('/');
          return;
        }

        setSeries(s);
        setFormData({
          name: s.name || '',
          description: s.description || '',
          coverImage: null, // נטען מחדש אם המשתמש יבחר קובץ חדש
        });
        setPreview(normalizeUploadUrl(s.coverImage));
      } catch (err) {
        console.error('Error loading series:', err);
        setError('Failed to load series.');
      }
    };

    fetchSeries();
  }, [seriesId, user._id, navigate]);

  useEffect(() => {
    // ניקוי ObjectURL אם נוצר
    return () => {
      if (preview?.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, coverImage: file }));

    // ניקוי קודמת אם הייתה
    if (preview?.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleConfirmUpdate = async () => {
    setShowModal(false);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      if (formData.coverImage) {
        data.append('coverImage', formData.coverImage);
      }

      await axios.put(`${API_BASE_URL}/api/series/${seriesId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Series updated successfully!');
      setTimeout(() => navigate(`/series/${seriesId}`), 1200);
    } catch (err) {
      console.error('Error updating series:', err);
      setError(`Failed to update series: ${err.response?.data?.message || err.message}`);
    }
  };

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!series) return <div>Loading...</div>;

  return (
    <div className="container mt-4">
      <h2>Edit Series</h2>

      {success && <div className="alert alert-success">{success}</div>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Series Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Cover Image</Form.Label>
          <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
        </Form.Group>

        {preview && (
          <div className="mb-3">
            <img
              src={preview}
              alt="Cover Preview"
              style={{ width: '200px', height: 'auto', borderRadius: '8px' }}
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder.jpg';
              }}
            />
          </div>
        )}

        <div className="d-flex gap-2">
          <Button type="submit" variant="primary">Save Changes</Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </Form>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Update</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to update this series?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirmUpdate}>Confirm</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EditSeries;
