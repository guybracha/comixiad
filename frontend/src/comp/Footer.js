// src/comp/Footer.jsx
import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../Footer.css";

function Footer() {
  return (
    <footer className="footer mt-auto py-5 bg-dark text-light">
      <Container>
        <Row className="gy-4">
          {/* לוגו ותיאור */}
          <Col md={4} className="text-center text-md-start">
            <h5 className="fw-bold text-uppercase mb-3 text-primary">Comixiad</h5>
            <p className="small mb-0">
              פלטפורמה ליצירה, קריאה ושיתוף של קומיקס מכל העולם. <br />
              © 2024–2025 כל הזכויות שמורות לגיא ברכה
            </p>
          </Col>

          {/* מידע משפטי */}
          <Col md={4} className="text-center text-md-start">
            <h6 className="fw-bold text-uppercase mb-3">מידע משפטי</h6>
            <ul className="list-unstyled small">
              <li className="mb-1">
                <Link to="/legal?tab=terms" className="footer-link">
                  תנאי שימוש
                </Link>
              </li>
              <li className="mb-1">
                <Link to="/legal?tab=privacy" className="footer-link">
                  מדיניות פרטיות
                </Link>
              </li>
              <li>
                <Link to="/legal?tab=accessibility" className="footer-link">
                  הצהרת נגישות
                </Link>
              </li>
            </ul>
          </Col>

          {/* רשתות חברתיות */}
          <Col md={4} className="text-center text-md-start">
            <h6 className="fw-bold text-uppercase mb-3">עקבו אחרינו</h6>
            <div className="d-flex justify-content-center justify-content-md-start gap-3">
              <a
                href="https://www.facebook.com/GuyBrachaComics"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Facebook"
              >
                <FaFacebook size={24} />
              </a>
              <a
                href="https://www.instagram.com/brachaverse/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon"
                aria-label="Instagram"
              >
                <FaInstagram size={24} />
              </a>
            </div>
          </Col>
        </Row>

        {/* קו תחתון */}
        <hr className="border-secondary my-4" />
        <Row>
          <Col className="text-center small text-muted">
            Comixiad • בנוי ב־React + Bootstrap
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
