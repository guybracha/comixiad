import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { API_BASE_URL } from '../Config';
import { GoogleLogin } from '@react-oauth/google'; // NEW
import jwtDecode from 'jwt-decode'; // אופציונלי, רק אם תרצה הדגמה מקומית

const RegistrationForm = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      }, { withCredentials: true });

      if (res.data.user) {
        setUser(res.data.user);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Google: קבלת credential ושליחה לשרת ---
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse; // ה-JWT ש-Google מחזיר
      // אופציונלי: console.log(jwtDecode(credential)); // לראות payload

      const res = await axios.post(
        `${API_BASE_URL}/api/auth/google`,
        { credential },
        { withCredentials: true } // אם אתה משתמש ב־cookies ל־JWT
      );

      if (res.data.user) {
        setUser(res.data.user);
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Google sign-in failed');
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed');
  };

  return (
    <div className="container mt-5">
      <h2>הרשמה</h2>

      {/* --- כפתור Google --- */}
      <div className="mb-3">
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
      </div>

      <div className="text-muted mb-3">או הרשמה עם אימייל וסיסמה:</div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">שם משתמש</label>
          <input
            type="text"
            className="form-control"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">אימייל</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">סיסמא</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">אימות סיסמא</label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'מבצע הרשמה...' : 'הרשמה'}
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;
