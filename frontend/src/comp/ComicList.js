import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../ComicList.css';

const ComicList = () => {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/comics');
      if (!response.data) throw new Error('No data received');
      setComics(response.data);
    } catch (error) {
      console.error('Error fetching comics:', error);
      setError(error.message || 'Failed to load comics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComics();
  }, []);

  const getImageUrl = (comic) => {
    // Check if comic has pages
    if (!comic?.pages?.[0]) return '/images/placeholder.jpg';
  
    const firstPage = comic.pages[0];
    const imagePath = firstPage.url || firstPage.filename;
  
    if (!imagePath) return '/images/placeholder.jpg';
  
    // Handle both URL formats
    if (imagePath.startsWith('/uploads/')) {
      return `http://localhost:5000${imagePath}`;
    }
  
    if (imagePath.startsWith('/')) {
      return `http://localhost:5000/uploads${imagePath}`;
    }
  
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!comics?.length) return <div className="no-comics">No comics found</div>;

  return (
    <div className="container mt-5">
      <div className="row">
        {comics.map((comic) => (
          <div className="col-md-4" key={comic._id}>
            <Link 
              to={`/comics/${comic._id}`} 
              className="text-decoration-none"
            >
              <div className="card mb-4 comic-card">
                <div className="comic-image-container">
                  <img
                    src={getImageUrl(comic)}
                    className="card-img-top comic-image"
                    alt={comic.title}
                    onError={(e) => {
                      e.target.src = '/images/placeholder.jpg';
                    }}
                  />
                </div>
                <div className="card-body">
                  <h5 className="card-title">{comic.title}</h5>
                  <p className="card-text">{comic.description}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComicList;