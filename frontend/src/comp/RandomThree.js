import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../Config';

const RandomThree = () => {
  const [randomComics, setRandomComics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndPickRandom = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/comics`);
        if (data.length > 0) {
          const shuffled = data.sort(() => 0.5 - Math.random());
          setRandomComics(shuffled.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching comics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndPickRandom();
  }, []);

  if (loading) return <div>טוען קומיקסים אקראיים...</div>;
  if (randomComics.length === 0) return <div>אין קומיקסים זמינים</div>;

  return (
    <div className="container my-4">
      <h3 className="mb-3">קומיקסים אקראיים</h3>
      <div className="row g-4">
        {randomComics.map((comic) => {
          const imageUrl = comic.pages?.[0]?.url
            ? `${API_BASE_URL}/${comic.pages[0].url.replace(/\\/g, '/')}`
            : '/images/placeholder.jpg';

          return (
            <div className="col-sm-6 col-md-4" key={comic._id}>
              <div className="card h-100">
                <img
                  src={imageUrl}
                  alt={comic.title}
                  className="card-img-top"
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{comic.title}</h5>
                  <p className="card-text">{comic.description?.slice(0, 80)}...</p>
                  <Link to={`/comics/${comic._id}`} className="btn btn-primary mt-auto">
                    קרא קומיקס
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RandomThree;
