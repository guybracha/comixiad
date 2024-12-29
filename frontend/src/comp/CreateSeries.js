import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Container } from 'react-bootstrap';

const CreateSeries = ({ userId }) => {
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

    if (!userId) {
      setError('You must be logged in to create a series.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('author', userId); // Add userId as the author
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }

      const response = await axios.post('http://localhost:5000/api/Series', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('Series created successfully!');
      setError('');
      setName('');
      setDescription('');
      setCoverImage(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
      setMessage('');
    }
  };

  return (
    <Container className="mt-5">
      <h2>Create New Series</h2>
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="seriesName" className="mb-3">
          <Form.Label>Series Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter series name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="seriesDescription" className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter series description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="seriesCoverImage" className="mb-3">
          <Form.Label>Cover Image</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleCoverImageChange}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Create Series
        </Button>
      </Form>
    </Container>
  );
};

export default CreateSeries;
