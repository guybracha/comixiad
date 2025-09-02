import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { API_BASE_URL } from '../../Config';

const CreatedSeriesList = ({ series, currentUserId, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Series Created</h3>

      {series.length === 0 && (
        <p>לא נמצאו סדרות שיצרת.</p>
      )}

      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {series.map((s) => {
          const imageUrl = s.coverImage
            ? `${API_BASE_URL}/uploads/${s.coverImage.replace(/\\/g, '/')}`
            : '/images/placeholder.jpg'; // ודא שהנתיב תקין

          return (
            <Col key={s._id}>
              <Card className="h-100 shadow-sm">
                <Card.Img
                  variant="top"
                  src={imageUrl}
                  alt={s.name}
                  style={{ height: '220px', objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => navigate(`/series/${s._id}`)}
                  onError={(e) => (e.target.src = '/images/placeholder.jpg')}
                />
                <Card.Body>
                  <Card.Title>{s.name}</Card.Title>
                  <Card.Text className="text-muted" style={{ fontSize: '0.95rem' }}>
                    {s.description}
                  </Card.Text>

                  {onDelete && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete(s._id)}
                    >
                      Delete
                    </Button>
                  )}
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => navigate(`/series/${s._id}/edit`)}
                    title="עריכת סדרה"
                  >
                    Edit
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default CreatedSeriesList;
