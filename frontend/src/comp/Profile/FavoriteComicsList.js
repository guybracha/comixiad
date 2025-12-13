// frontend/src/comp/Profile/FavoriteComicsList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../Config';
import { useTranslation } from 'react-i18next';
import '../../ComicList.css';

const FavoriteComicsList = ({ userId }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchFavorites();
  }, [userId]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/api/users/${userId}/favorites`);
      setFavorites(data.favoriteComics || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Failed to load favorite comics');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (comic) => {
    if (!comic?.pages?.[0]) {
      return 'https://via.placeholder.com/300x400/cccccc/666666?text=No+Image';
    }

    const firstPage = comic.pages[0];
    const imagePath = firstPage.url || firstPage.filename || firstPage.path;

    if (!imagePath) {
      return 'https://via.placeholder.com/300x400/cccccc/666666?text=No+Image';
    }

    let cleanPath = imagePath.replace(/\\/g, '/');
    
    if (cleanPath.startsWith('http')) return cleanPath;
    if (cleanPath.startsWith('uploads/')) return `${API_BASE_URL}/${cleanPath}`;
    if (cleanPath.startsWith('/uploads/')) return `${API_BASE_URL}${cleanPath}`;
    if (cleanPath.includes('/uploads/')) {
      const uploadsIndex = cleanPath.lastIndexOf('/uploads/');
      cleanPath = cleanPath.substring(uploadsIndex + 1);
      return `${API_BASE_URL}/${cleanPath}`;
    }
    
    return `${API_BASE_URL}/uploads/comics/${cleanPath}`;
  };

  const truncateText = (text, maxLength = 100) =>
    text?.length > maxLength ? text.slice(0, maxLength) + '…' : text || '';

  if (loading) {
    return <div className="loading-spinner">Loading favorites...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="no-favorites text-center p-4">
        <p className="text-muted">
          {t('noFavorites') || 'No favorite comics yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <h3 className="section-title">
        ❤️ {t('favoriteComics') || 'Favorite Comics'} ({favorites.length})
      </h3>
      <div className="container mt-3">
        <div className="row">
          {favorites.map((comic) => (
            <div className="col-md-4 col-sm-6" key={comic._id}>
              <Link to={`/comics/${comic._id}`} className="text-decoration-none">
                <div className="card mb-4 comic-card">
                  <div className="comic-image-container">
                    <img
                      src={getImageUrl(comic)}
                      className="card-img-top comic-image"
                      alt={comic.title}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://via.placeholder.com/300x400/cccccc/666666?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="comic-info-box p-3">
                    <h5 className="comic-title text-center">{comic.title}</h5>
                    <p className="comic-description">{truncateText(comic.description)}</p>
                    <div className="comic-stats text-center">
                      <span className="badge bg-primary">
                        👁 {comic.views?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FavoriteComicsList;
