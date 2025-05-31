import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Row, Col } from 'react-bootstrap';
import { API_BASE_URL } from '../Config';

function TopFive() {
  const [topComics, setTopComics] = useState([]);

  useEffect(() => {
    const fetchTopComics = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/comics/top`);
        setTopComics(response.data);
      } catch (error) {
        console.error('Failed to fetch top comics:', error);
      }
    };

    fetchTopComics();
  }, []);

  // ✅ מחזיר את כתובת התמונה של עמוד 1 (fallback אם אין)
  const getImageUrl = (comic) => {
    if (!comic?.pages?.[0]) return '/images/placeholder.jpg';

    const firstPage = comic.pages[0];
    const imagePath = firstPage.url || firstPage.filename;

    if (!imagePath) return '/images/placeholder.jpg';
    if (imagePath.startsWith('uploads/')) return `${API_BASE_URL}/${imagePath}`;
    if (imagePath.startsWith('/')) return `${API_BASE_URL}/uploads${imagePath}`;

    return `${API_BASE_URL}/uploads/${imagePath}`;
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Top 5 Most Viewed Comics</h3>
      <Row xs={1} sm={2} md={3} lg={5} className="g-3">
        {topComics.map((comic, index) => (
          <Col key={comic._id}>
            <Card className="h-100">
              <Card.Img
                variant="top"
                src={getImageUrl(comic)}
                alt={comic.title}
                onError={(e) => { e.target.src = '/images/placeholder.jpg'; }}
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <Card.Body className="text-center">
                <Card.Title>{`${comic.title} ${index + 1}`}</Card.Title>
                <Card.Text>
                  <strong>VIEWS:</strong> {comic.views}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default TopFive;
