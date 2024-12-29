import React from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';
import '../About.css';

function About() {
  return (
    <Container className="about-container my-5">
      <Row className="text-center mb-5">
        <Col>
          <h1 className="display-4 mb-4">ברוכים הבאים ל-COMIXIAD</h1>
          <p className="lead">עולם חדש ומופלא של יצירת קומיקס</p>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col md={4} className="mb-4">
          <Card className="h-100 feature-card">
            <Card.Body>
              <Card.Title>יצירה</Card.Title>
              <Card.Text>
                צרו קומיקס משלכם בקלות ובמהירות.
                העלו תמונות, הוסיפו טקסט וארגנו את העמודים כרצונכם.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100 feature-card">
            <Card.Body>
              <Card.Title>שיתוף</Card.Title>
              <Card.Text>
                שתפו את היצירות שלכם עם חברים וקוראים מכל העולם.
                קבלו משוב ותגובות מהקהילה.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100 feature-card">
            <Card.Body>
              <Card.Title>קהילה</Card.Title>
              <Card.Text>
                הצטרפו לקהילת יוצרים תוססת.
                גלו יצירות חדשות והתחברו עם יוצרים אחרים.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="text-center mb-5">
        <Col>
          <h2 className="mb-4">למה COMIXIAD?</h2>
          <p className="lead">
            COMIXIAD הוא פלטפורמה ייחודית המאפשרת ליוצרים לפרסם את הקומיקס שלהם בקלות ובחינם.
            אנחנו מאמינים שלכל אחד יש סיפור לספר, ואנחנו כאן כדי לעזור לכם לספר אותו.
          </p>
        </Col>
      </Row>

      <Row className="text-center">
        <Col>
          <h3 className="mb-4">יצר: גיא ברכה</h3>
          <p>מפתח ויוצר COMIXIAD</p>
          <p className="contact-info">
            צרו קשר: <a href="mailto:guy.bracha@gmail.com">כאן</a>
          </p>
        </Col>
      </Row>
    </Container>
  );
}

export default About;