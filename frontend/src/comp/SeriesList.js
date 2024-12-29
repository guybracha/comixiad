import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';

const SeriesList = () => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/Series');
        setSeries(response.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch series. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, []);

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading series...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row>
        {series.map((serie) => (
          <Col key={serie._id} sm={12} md={6} lg={4} className="mb-4">
            <Card>
              {serie.coverImage && (
                <Card.Img
                  variant="top"
                  src={`http://localhost:5000/${serie.coverImage}`}
                  alt={`${serie.name} cover`}
                />
              )}
              <Card.Body>
                <Card.Title>{serie.name}</Card.Title>
                <Card.Text>{serie.description}</Card.Text>
                <Button variant="primary">View Details</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default SeriesList;
