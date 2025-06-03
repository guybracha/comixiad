import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import '../Footer.css';

function Footer() {
  return (
    <footer className="footer mt-auto py-4">
      <Container>
        <Row className="text-center text-md-start">
          <Col md={4} className="mb-3">
            <h5 className="text-primary">COMIXIAD</h5>
            <p className="small">
              פלטפורמה ליצירה ושיתוף של קומיקס
              <br />
              כל הזכויות שמורות לגיא ברכה © 2025-2024
            </p>
          </Col>
          
          <Col md={4} className="mb-3 social-links">
            <h5 className="text-primary">עקבו אחרינו</h5>
            <div className="d-flex justify-content-center justify-content-md-start gap-3">
              <a href="https://www.facebook.com/GuyBrachaComics" className="social-icon"><FaFacebook size={24} /></a>
              <a href="https://www.instagram.com/brachaverse/" className="social-icon"><FaInstagram size={24} /></a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;