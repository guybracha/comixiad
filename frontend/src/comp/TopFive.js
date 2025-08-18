import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../Config';
import { useTranslation } from 'react-i18next';
import '../TopFive.css';

function TopFive() {
  const [topComics, setTopComics] = useState([]);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchTopComics = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/comics/top`);
        setTopComics(response.data);
      } catch (error) {
        console.error('Failed to fetch top comics:', error);
      }
    };

    fetchTopComics();
  }, []);

  const getImageUrl = (comic) => {
    if (!comic?.pages?.[0]) return '/images/placeholder.jpg';

    const firstPage = comic.pages[0];
    const imagePath = firstPage.url || firstPage.filename;

    if (!imagePath) return '/images/placeholder.jpg';
    if (imagePath.startsWith('uploads/')) return `${API_BASE_URL}/${imagePath}`;
    if (imagePath.startsWith('/')) return `${API_BASE_URL}/uploads${imagePath}`;

    return `${API_BASE_URL}/uploads/${imagePath}`;
  };

  return (
    <div className="top-five-container container mt-4">
      <h2 className="top-five-title">🔥 {t('topFiveTitle')}</h2>
      <div className="row g-4">
        {topComics.map((comic, index) => (
          <div className="col-6 col-md-4 col-lg-2" key={comic._id}>
            <div className="comic-card-top">
              <div className={`rank-badge rank-${index + 1}`}>
                #{index + 1}
              </div>
              <img
                src={getImageUrl(comic)}
                alt={comic.title}
                className="comic-top-img"
                onError={(e) => {
                  e.target.src = '/images/placeholder.jpg';
                }}
              />
              <div className="comic-info">
                <h5 className="comic-title">{comic.title}</h5>
                <p className="comic-views">
                  👁 {comic.views.toLocaleString(
                    i18n.language === 'he' ? 'he-IL' : 'en-US'
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopFive;
