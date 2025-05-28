import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import '../Navbar.css';
import { API_BASE_URL } from '../Config';
import logo from '../img/logo.jpg'; // נניח שיש לך לוגו בתיקייה assets

const Navbar = () => {
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
    window.location.reload(); // מרענן כדי לעדכן סטייט של המשתמש
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode', !darkMode);
  };

  return (
    <nav className={`navbar navbar-expand-lg ${darkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-light'} shadow-sm`}>
      <div className="container-fluid">
      <Link className="navbar-brand d-flex align-items-center" to="/">
        <img
          src={logo}
          alt="Comixiad Logo"
          style={{ height: '40px', marginRight: '10px' }}
        />
      </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><Link className="nav-link" to="/">🏠 בית</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/upload">📤 העלה קומיקס</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/CreateSeries">🎞️ צור סדרה</Link></li>
            {user && (
              <li className="nav-item"><Link className="nav-link" to={`/profile/${user._id}`}>👤 פרופיל</Link></li>
            )}
          </ul>

          <form className="d-flex me-3" onSubmit={handleSearchSubmit}>
            <input
              className="form-control rounded-pill px-3"
              type="search"
              placeholder="חפש..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-success ms-2 rounded-pill px-4" type="submit">🔍</button>
          </form>

          <button className="btn btn-outline-secondary rounded-pill me-2" onClick={toggleDarkMode}>
            {darkMode ? '☀️ מצב בהיר' : '🌙 מצב כהה'}
          </button>

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
              <button className="btn btn-outline-danger rounded-pill px-3" onClick={handleLogoutClick}>
                🚪 התנתק
              </button>
            </div>
          ) : (
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/login">🔑 התחבר</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/register">📝 הירשם</Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
