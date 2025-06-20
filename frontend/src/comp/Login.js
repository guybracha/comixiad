import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { API_BASE_URL } from '../Config';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useUser(); // ⬅️ פונקציה מה-Context
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
                const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                email,
                password
            });

            const { user, token } = response.data;

            if (user && token) {
                login(user, token); // ✅ קורא לפונקציה מה-Context ששומרת גם token
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

    return (
        <div className="container mt-5">
            <h2>התחבר</h2>
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
