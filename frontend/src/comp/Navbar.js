// src/comp/Navbar.js   (או הנתיב שבו הקובץ יושב)
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTranslation } from 'react-i18next';
import '../Navbar.css';
import { API_BASE_URL } from '../Config';
import logo from '../img/logo.jpg';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?query=${searchQuery}`);
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
    window.location.reload();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode', !darkMode);
  };

  // ——— כפתור החלפת שפה קטן  ———
  const otherLng = i18n.language === 'he' ? 'en' : 'he';
  const switchLabel = otherLng === 'he' ? 'עִבְרִית' : 'EN';

  return (
    <nav
      className={`navbar navbar-expand-lg ${
        darkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-light'
      } shadow-sm`}
    >
      <div className="container-fluid">
        {/* לוגו  */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src={logo}
            alt="Comixiad Logo"
            style={{ height: '40px', marginRight: '10px' }}
          />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          {/* ——— קישורי ניווט ——— */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                🏠 {t('nav.home')}
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/upload">
                📤 {t('nav.upload')}
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/CreateSeries">
                🎞️ {t('nav.createSeries')}
              </Link>
            </li>
            {user && (
              <li className="nav-item">
                <Link className="nav-link" to={`/profile/${user._id}`}>
                  👤 {t('nav.profile')}
                </Link>
              </li>
            )}
          </ul>

          {/* ——— חיפוש ——— */}
          <form className="d-flex me-3" onSubmit={handleSearchSubmit}>
            <input
              className="form-control rounded-pill px-3"
              type="search"
              placeholder={t('nav.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className="btn btn-success ms-2 rounded-pill px-4"
              type="submit"
              aria-label={t('nav.searchBtn')}
            >
              🔍
            </button>
          </form>

          {/* ——— מצב כהה/בהיר ——— */}
          <button
            className="btn btn-outline-secondary rounded-pill me-2"
            onClick={toggleDarkMode}
          >
            {darkMode ? '☀️ ' + t('nav.light') : '🌙 ' + t('nav.dark')}
          </button>

          {/* ——— מתג שפה ——— */}
          <button
            className="btn btn-outline-primary rounded-pill me-2"
            onClick={() => i18n.changeLanguage(otherLng)}
          >
            {switchLabel}
          </button>

          {/* ——— התחברות / פרופיל ——— */}
          {user ? (
            <div className="d-flex align-items-center">
              <img
                src={
                  user.avatar
                    ? user.avatar.startsWith('http')
                      ? user.avatar
                      : `${API_BASE_URL}/${user.avatar.replace(/\\/g, '/')}`
                    : 'https://www.gravatar.com/avatar/?d=mp'
                }
                alt="avatar"
                className="rounded-circle me-2"
                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://www.gravatar.com/avatar/?d=mp';
                }}
              />
              <button
                className="btn btn-outline-danger rounded-pill px-3"
                onClick={handleLogoutClick}
              >
                🚪 {t('nav.logout')}
              </button>
            </div>
          ) : (
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  🔑 {t('nav.login')}
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/register">
                  📝 {t('nav.register')}
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
