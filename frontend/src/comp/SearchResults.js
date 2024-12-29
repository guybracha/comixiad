import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../SearchResults.css';

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
                const response = await axios.get(`http://localhost:5000/api/search?query=${query}`);
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container mt-4">
            <h2>Search Results for "{query}"</h2>

            <h3>Comics</h3>
            <div className="results-grid">
                {comics.map((comic) => (
                    <div key={comic._id} className="result-card">
                        <img
                            src={`http://localhost:5000/uploads/${comic.pages[0]?.url}`}
                            alt={comic.title}
                            className="result-image"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder.jpg';
                            }}
                        />
                        <div className="card-body">
                            <h5>{comic.title}</h5>
                            <p>{comic.description}</p>
                            <button 
                                className="btn btn-primary"
                                onClick={() => navigate(`/comics/${comic._id}`)}
                            >
                                View Comic
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <h3>Series</h3>
            <div className="results-grid">
                {series.map((seriesItem) => (
                    <div key={seriesItem._id} className="result-card">
                        <img
                            src={`http://localhost:5000/uploads/${seriesItem.coverImage}`}
                            alt={seriesItem.name}
                            className="result-image"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder.jpg';
                            }}
                        />
                        <div className="card-body">
                            <h5>{seriesItem.name}</h5>
                            <p>{seriesItem.description}</p>
                            <button 
                                className="btn btn-primary"
                                onClick={() => navigate(`/series/${seriesItem._id}`)}
                            >
                                View Series
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <h3>Users</h3>
            <div className="results-grid">
                {users.map((user) => (
                    <div key={user._id} className="result-card">
                        <img
                            src={user.avatar || '/placeholder.jpg'}
                            alt={user.username}
                            className="result-image"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder.jpg';
                            }}
                        />
                        <div className="card-body">
                            <h5>{user.username}</h5>
                            <p>{user.bio}</p>
                            <button 
                                className="btn btn-primary"
                                onClick={() => navigate(`/profile/${user._id}`)}
                            >
                                View Profile
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchResults;