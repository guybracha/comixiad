import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner'; // רכיב לטעינה

const ComicList = () => {
  const [error, setError] = useState(null);
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComics = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/comics');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setComics(data);
      } catch (error) {
        console.error('Error fetching comics:', error);
        setError('There was an error fetching comics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchComics();
  }, []);

  return (
    <div className="container mt-4">
      {loading && (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {error && <div className="alert alert-danger text-center">{error}</div>}

      {!loading && !error && (
        <div className="row">
          {comics.length > 0 ? (
            comics.map((comic) => (
              <div key={comic._id} className="col-md-4 mb-4">
                <div className="card shadow-sm h-100">
                  <Link to={`/comics/${comic._id}`} className="text-decoration-none">
                    <img
                      src={`http://localhost:5000${comic.pages[0]?.url || '/default-comic-cover.jpg'}`}
                      alt={`${comic.title} cover`}
                      className="card-img-top"
                      style={{ height: '300px', objectFit: 'cover' }}
                    />
                  </Link>
                  <div className="card-body">
                    <h5 className="card-title">{comic.title}</h5>
                    <p className="card-text text-truncate">{comic.description || 'No description available.'}</p>
                  </div>
                  <div className="card-footer">
                    <span className="badge bg-primary">{comic.genre || 'Unknown Genre'}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center">
              <p>No comics available at the moment. Please check back later!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComicList;
