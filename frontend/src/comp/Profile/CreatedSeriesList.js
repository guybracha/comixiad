import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';

const CreatedSeriesList = ({ series, currentUserId, onDelete }) => (
  <div className="container mt-4">
    <h3 className="mb-4">Series Created</h3>
    <Row xs={1} sm={2} md={3} lg={4} className="g-4">
      {series.map((s) => (
        <Col key={s._id}>
          <Card className="h-100 shadow-sm">
            <Card.Img
              variant="top"
              src={`http://localhost:5000/uploads/${s.coverImage}`}
              alt={s.name}
              style={{ height: '220px', objectFit: 'cover' }}
            />
            <Card.Body>
              <Card.Title>{s.name}</Card.Title>
              <Card.Text className="text-muted" style={{ fontSize: '0.95rem' }}>
                {s.description}
              </Card.Text>
              {s.author === currentUserId && (
                <Button variant="danger" size="sm" onClick={() => onDelete(s._id)}>
                  Delete
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  </div>
);

export default CreatedSeriesList;
