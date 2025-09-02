import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { API_BASE_URL } from '../Config';
import { GoogleLogin } from '@react-oauth/google'; // ⬅️ ייבוא

const Login = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // התחברות רגילה עם אימייל+סיסמה
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      const { user, token } = response.data;
      if (user && token) {
        login(user, token);
        navigate('/');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // התחברות עם גוגל
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      if (!credential) {
        setError('Google login failed: missing credential');
        return;
      }

      const res = await axios.post(
        `${API_BASE_URL}/api/auth/google`,
        { credential },
        { withCredentials: true }
      );

      const { user, token } = res.data;
      if (user && token) {
        login(user, token);
        navigate('/');
      } else {
        setError('Invalid Google login response');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Google login failed');
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed');
  };

  return (
    <div className="container mt-5">
      <h2>התחבר</h2>

      {/* כפתור התחברות עם גוגל */}
      <div className="mb-3">
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
      </div>

      <div className="text-muted mb-3">או התחבר עם אימייל וסיסמה:</div>

      {/* טופס התחברות רגיל */}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="כתובת מייל"
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="סיסמא"
            required
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
