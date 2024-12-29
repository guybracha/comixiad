import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search).get('query');
    const [results, setResults] = useState({ comics: [], series: [], users: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/search?query=${query}`);
                setResults(response.data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch search results');
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            fetchResults();
        }
    }, [query]);

    if (loading) return <div className="text-center p-5">Loading...</div>;
    if (error) return <div className="alert alert-danger m-4">{error}</div>;

    return (
        <div className="container py-5">
            <h2>Search Results for "{query}"</h2>
            <div className="row g-4">
                <h3>Comics</h3>
                {results.comics.map(comic => (
                    <div key={comic._id} className="col-md-6">
                        <div className="card h-100">
                            <img 
                                src={comic.pages[0]?.url ? `http://localhost:5000/uploads/${comic.pages[0].url}` : '/default-cover.jpg'} 
                                alt={comic.title}
                                className="card-img-top"
                                style={{ height: '200px', objectFit: 'cover' }}
                            />
                            <div className="card-body">
                                <h5>{comic.title}</h5>
                                <p>{comic.description}</p>
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => navigate(`/comics/${comic._id}`)}
                                >
                                    Read Now
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="row g-4">
                <h3>Series</h3>
                {results.series.map(series => (
                    <div key={series._id} className="col-md-6">
                        <div className="card h-100">
                            <img 
                                src={series.coverImage ? `http://localhost:5000/uploads/${series.coverImage}` : '/default-cover.jpg'} 
                                alt={series.title}
                                className="card-img-top"
                                style={{ height: '200px', objectFit: 'cover' }}
                            />
                            <div className="card-body">
                                <h5>{series.title}</h5>
                                <p>{series.description}</p>
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => navigate(`/series/${series._id}`)}
                                >
                                    View Series
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="row g-4">
                <h3>Users</h3>
                {results.users.map(user => (
                    <div key={user._id} className="col-md-6">
                        <div className="card h-100">
                            <img 
                                src={user.avatar ? `http://localhost:5000/uploads/${user.avatar}` : '/default-avatar.jpg'} 
                                alt={user.username}
                                className="card-img-top"
                                style={{ height: '200px', objectFit: 'cover' }}
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
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchResults;