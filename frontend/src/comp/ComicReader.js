import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../ComicReader.css';
import { Helmet } from 'react-helmet';
import { API_BASE_URL } from '../Config';
import { Modal } from 'react-bootstrap';

const ComicReader = () => {
  const { id: comicId } = useParams();
  const [comic, setComic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgErrors, setImgErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchComic = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/comics/${comicId}`);
        setComic(response.data);

        await axios.put(`${API_BASE_URL}/api/comics/${comicId}/view`);
      } catch (err) {
        console.error('Error fetching comic:', err);
        setError('Failed to load comic');
      } finally {
        setLoading(false);
      }
    };

    fetchComic();
  }, [comicId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <Helmet>
        <title>{comic.title} - קומיקס ב־Comixiad</title>
        <meta name="description" content={comic.description} />
        <meta property="og:image" content={`${API_BASE_URL}/${comic.pages[0]?.url}`} />
      </Helmet>

      <h2>{comic?.title || 'Untitled'}</h2>
      <p>{comic?.description || 'No description available'}</p>
      <div className="d-flex justify-content-between align-items-center mb-3">
  <span>Views: {comic?.views || 0}</span>

  <div className="d-flex gap-2">
    {/* שיתוף לפייסבוק */}
    <a
      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://comixiad.com/comics/${comicId}`)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-outline-primary btn-sm"
    >
      <i className="bi bi-facebook me-1"></i> שתף בפייסבוק
    </a>

    {/* שיתוף לוואטסאפ */}
    <a
      href={`https://wa.me/?text=${encodeURIComponent(`📖 ${comic.title} ב־Comixiad: https://comixiad.com/comics/${comicId}`)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-outline-success btn-sm"
    >
      <i className="bi bi-whatsapp me-1"></i> שתף בוואטסאפ
    </a>
  </div>
</div>


      {comic.author && (
        <div className="d-flex align-items-center my-3">
          <img
            src={
              comic.author.avatar
                ? comic.author.avatar.startsWith('http')
                  ? comic.author.avatar
                  : `${API_BASE_URL}/${comic.author.avatar.replace(/\\/g, '/')}`
                : 'https://www.gravatar.com/avatar/?d=mp'
            }
            alt={comic.author.username}
            className="rounded-circle me-2"
            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://www.gravatar.com/avatar/?d=mp';
            }}
          />
          <a href={`/profile/${comic.author._id}`} className="fw-bold text-decoration-none">
            {comic.author.username}
          </a>
        </div>
      )}

      <div className="comic-pages">
        {comic?.pages?.length > 0 ? (
          comic.pages.map((page, index) => {
            const imageUrl = `${API_BASE_URL}/${page.url.replace(/\\/g, '/')}`;
            return (
              <div key={index} className="comic-page mb-4">
                {!imgErrors[index] ? (
                  <img
                    src={imageUrl}
                    alt={`Page ${index + 1}`}
                    onError={(e) => {
                      setImgErrors((prev) => ({ ...prev, [index]: true }));
                      e.target.onerror = null;
                      e.target.src = 'https://www.gravatar.com/avatar/?d=mp';
                    }}
                    className="img-fluid"
                  />
                ) : (
                  <div className="text-danger">
                    ⚠️ Failed to load page {index + 1}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p>No pages available</p>
        )}
      </div>
    </div>
  );
};

export default ComicReader;
