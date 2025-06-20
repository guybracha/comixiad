import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { API_BASE_URL } from '../Config';
import '../SeriesList.css';

const SeriesList = () => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/series`);
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
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        {series.map((seriesItem) => (
          <Col key={seriesItem._id} md={4} className="mb-4">
            <Card className='series-card'>
              <Card.Img
                variant="top"
                src={`${API_BASE_URL}/uploads/${seriesItem.coverImage}`}
              />
              <Card.Body>
                <Card.Title>{seriesItem.name}</Card.Title>
                <Card.Text>{seriesItem.description}</Card.Text>
                <Button variant="primary" onClick={() => navigate(`/series/${seriesItem._id}`)}>
                  ראה סדרה
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default SeriesList;
