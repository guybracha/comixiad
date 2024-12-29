import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Spinner, Alert, Card, Row, Col } from 'react-bootstrap';

const SeriesDetail = () => {
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/series/${id}`);
        setSeries(response.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch series. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchComics = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/comics/series/${id}`);
        setComics(response.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch comics. Please try again later.');
      }
    };

    fetchSeries();
    fetchComics();
  }, [id]);

  if (loading) {
    return (
      <Container className="py-5">
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
      {series && (
        <Card className="mb-4">
          <Card.Img variant="top" src={`http://localhost:5000/uploads/${series.coverImage}`} />
          <Card.Body>
            <Card.Title>{series.name}</Card.Title>
            <Card.Text>{series.description}</Card.Text>
          </Card.Body>
        </Card>
      )}
      <h3>Comics in this Series</h3>
      <Row>
        {comics.map((comic) => (
          <Col key={comic._id} md={4} className="mb-4">
            <Card>
              <Card.Img variant="top" src={`http://localhost:5000/uploads/${comic.coverImage}`} />
              <Card.Body>
                <Card.Title>{comic.title}</Card.Title>
                <Card.Text>{comic.description}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default SeriesDetail;