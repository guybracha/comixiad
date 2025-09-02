// src/comp/account/CreatedSeriesList.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, ButtonGroup } from 'react-bootstrap';
import { API_BASE_URL } from '../../Config';

const normalizeUrl = (u) => {
  if (!u) return '/images/placeholder.jpg';
  let cleaned = String(u).replace(/\\/g, '/').replace(/^\/+/, '');
  if (!cleaned.startsWith('uploads/')) cleaned = `uploads/${cleaned}`;
  return `${API_BASE_URL}/${cleaned}`;
};

const CreatedSeriesList = ({ series, currentUserId, onDelete }) => {
  const navigate = useNavigate();

  const handleDelete = (id, name) => {
    if (!onDelete) return;
    const ok = window.confirm(`למחוק את הסדרה "${name}"? פעולה זו אינה הפיכה.`);
    if (ok) onDelete(id);
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Series Created</h3>

      {(!series || series.length === 0) && <p>לא נמצאו סדרות שיצרת.</p>}

      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {series.map((s) => {
          const imageUrl = s.coverImage ? normalizeUrl(s.coverImage) : '/images/placeholder.jpg';
          // אם תרצה להקפיד שרק היוצר יערוך:
          // const authorId = typeof s.author === 'string' ? s.author : s.author?._id;
          // const canEdit = !currentUserId || authorId === currentUserId;
          const canEdit = true; // לפי הבקשה — להציג תמיד בדף "הסדרות שיצרת"

          return (
            <Col key={s._id}>
              <Card className="h-100 shadow-sm">
                <Card.Img
                  variant="top"
                  src={imageUrl}
                  alt={s.name}
                  style={{ height: '220px', objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => navigate(`/series/${s._id}`)}
                  onError={(e) => {
                    e.currentTarget.src = '/images/placeholder.jpg';
                  }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="mb-1">{s.name}</Card.Title>
                  <Card.Text className="text-muted mb-3" style={{ fontSize: '0.95rem' }}>
                    {s.description}
                  </Card.Text>

                  {canEdit && (
                    <div className="mt-auto d-flex justify-content-between align-items-center">
                      <ButtonGroup>
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => navigate(`/series/${s._id}/edit`)}
                          title="עריכת סדרה"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(s._id, s.name)}
                          title="מחיקת סדרה"
                        >
                          Delete
                        </Button>
                      </ButtonGroup>

                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/series/${s._id}`)}
                      >
                        פתיחה
                      </Button>
                    </div>
                  )}
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
