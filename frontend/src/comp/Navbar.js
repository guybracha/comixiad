// src/comp/Navbar.js
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTranslation } from 'react-i18next';
import '../Navbar.css';
import { API_BASE_URL } from '../Config';
import logo from '../img/logo.jpg';

const baseLang = (lng = 'en') => lng.toLowerCase().split('-')[0];
const isRTL = (lng) => ['he', 'ar', 'fa', 'ur'].includes(baseLang(lng));

/** נירמול avatar ל־URL ציבורי שניתן להציג בדפדפן */
function buildAvatarUrl(raw) {
  if (!raw) return null;
  if (raw.startsWith('http')) return raw; // כבר URL מלא

  // unify slashes
  let p = raw.replace(/\\/g, '/');

  // אם נשמר נתיב מוחלט ממערכת קבצים (e.g. /root/backend/uploads/xxx.jpg)
  const pos = p.lastIndexOf('/uploads/');
  if (pos !== -1) {
    p = p.slice(pos + 1); // "uploads/xxx.jpg"
  } else {
    // וריאציות נפוצות
    p = p.replace(/^\/?root\/backend\/uploads\//, 'uploads/');
    p = p.replace(/^\/?backend\/uploads\//, 'uploads/');
    p = p.replace(/^\/?uploads\//, 'uploads/');
  }

  // ודא שאין סלאשים מובילים
  p = p.replace(/^\/+/, '');

  return `${API_BASE_URL}/${p}`;
}

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
    window.location.reload();
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.body.classList.toggle('dark-mode', next);
      return next;
    });
  };

  // --- לשוניות שפה (כפתור החלפה אחד) ---
  const current = baseLang(i18n.resolvedLanguage || i18n.language);
  const otherLng = current === 'he' ? 'en' : 'he';
  const switchLabel = otherLng === 'he' ? 'עִבְרִית' : 'EN';

  const handleSwitchLanguage = async () => {
    const code = otherLng;
    await i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    document.documentElement.lang = code;
    document.documentElement.dir = isRTL(code) ? 'rtl' : 'ltr';
  };

  // URL של אווטאר משתמש
  const userAvatarUrl = useMemo(() => {
    const url = buildAvatarUrl(user?.avatar);
    return url || 'https://www.gravatar.com/avatar/?d=mp';
  }, [user?.avatar]);

  return (
    <nav
      className={`navbar navbar-expand-lg ${
        darkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-light'
      } shadow-sm`}
    >
      <div className="container-fluid">
        {/* לוגו */}
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
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
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
            onClick={handleSwitchLanguage}
            aria-label="Switch language"
          >
            {switchLabel}
          </button>

          {/* ——— התחברות / פרופיל ——— */}
          {user ? (
            <div className="d-flex align-items-center">
              {/* מקשר גם לפרופיל של המשתמש */}
              <Link to={`/profile/${user._id}`} className="d-inline-block me-2">
                <img
                  src={userAvatarUrl}
                  alt={`${user.username || 'user'} avatar`}
                  className="rounded-circle"
                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://www.gravatar.com/avatar/?d=mp';
                  }}
                />
              </Link>

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
