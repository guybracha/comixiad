import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../SearchResults.css';
import { API_BASE_URL } from '../Config'
import RandomThree from './RandomThree';

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search).get('query');
    const [comics, setComics] = useState([]);
    const [series, setSeries] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/search?query=${encodeURIComponent(query)}`);
                const { comics, series, users } = response.data;

                setComics(comics);
                setSeries(series);
                setUsers(users);
                setError('');
            } catch (err) {
                console.error('Error fetching search results:', err);
                setError('Failed to fetch search results. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [query]);

    if (loading) return <div>טוען...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container mt-4">
            <h2>תוצאות חיפוש עבור: "{query}"</h2>

            <h3>קומיקסים</h3>
            <div className="results-grid">
                {comics.map((comic) => (
                    <div key={comic._id} className="result-card">
                        <img
                            src={
                            comic.pages[0]?.url
                                ? `${API_BASE_URL}/${comic.pages[0].url.replace(/\\/g, '/')}`
                                : 'https://www.gravatar.com/avatar/?d=mp'
                            }
                            alt={comic.title}
                            className="result-image"
                            />
                        <div className="card-body">
                            <h5>{comic.title}</h5>
                            <p>{comic.description}</p>
                            <button 
                                className="btn btn-primary"
                                onClick={() => navigate(`/comics/${comic._id}`)}
                            >
                                ראה קומיקס
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <h3>סדרות</h3>
            <div className="results-grid">
                {series.map((seriesItem) => (
                    <div key={seriesItem._id} className="result-card">
                        <img
                            src={
                            seriesItem.coverImage
                                ? `${API_BASE_URL}/uploads/${seriesItem.coverImage}`
                                : 'https://www.gravatar.com/avatar/?d=mp'
                            }
                        alt={seriesItem.name}
                        className="result-image"
                        />
                        <div className="card-body">
                            <h5>{seriesItem.name}</h5>
                            <p>{seriesItem.description}</p>
                            <button 
                                className="btn btn-primary"
                                onClick={() => navigate(`/series/${seriesItem._id}`)}
                            >
                                ראה סדרה
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <h3>משתמשים</h3>
            <div className="results-grid">
                {users.map((user) => (
                    <div key={user._id} className="result-card">
                        <img
                            src={
                            user.avatar
                                ? user.avatar.startsWith('http')
                                ? user.avatar
                                : `${API_BASE_URL}/${user.avatar.replace(/\\/g, '/')}`
                                : 'https://www.gravatar.com/avatar/?d=mp'
                            }
                            alt={user.username}
                            className="result-image"
                                onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://www.gravatar.com/avatar/?d=mp';
                                }}
                        />
                        <div className="card-body">
                            <h5>{user.username}</h5>
                            <p>{user.bio}</p>
                            <button 
                                className="btn btn-primary"
                                onClick={() => navigate(`/profile/${user._id}`)}
                            >
                                ראה פרופיל
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <RandomThree/>
        </div>
    );
};

export default SearchResults;