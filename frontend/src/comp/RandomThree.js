import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../Config';
import '../ComicList.css'; // נשתמש באותו CSS כמו הקומפוננטה הראשית

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
        {randomComics.map((comic, index) => {
  const imageUrl = comic.pages?.[0]?.url
    ? `${API_BASE_URL}/${comic.pages[0].url.replace(/\\/g, '/')}`
    : '/images/placeholder.jpg';

  // בחר אנימציה רנדומלית לכל כרטיס
  const animationClass = Math.random() > 0.5 ? 'fade-in-up' : 'fade-in-scale';

  return (
    <div className={`col-sm-6 col-md-4 ${animationClass}`} key={comic._id}>
      <Link to={`/comics/${comic._id}`} className="text-decoration-none">
        <div className="card h-100 comic-card">
          <div className="comic-image-container">
            <img
              src={imageUrl}
              alt={comic.title}
              className="card-img-top comic-image"
              onError={(e) => {
                e.target.src = '/images/placeholder.jpg';
              }}
            />
          </div>
              <div className="comic-info-box p-3 d-flex flex-column">
                <h5 className="comic-title text-center">{comic.title}</h5>
                <p className="comic-description">{comic.description?.slice(0, 100)}...</p>
                <div className="mt-auto text-center">
                  <span className="btn btn-outline-primary btn-sm">קרא קומיקס</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      );
    })}
      </div>
    </div>
  );
};

export default RandomThree;
