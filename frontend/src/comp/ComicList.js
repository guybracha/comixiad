import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../ComicList.css';
import { API_BASE_URL } from '../Config';

const ComicList = () => {
  const [comics, setComics] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // בקשת רשימת קומיקסים עם ביטול בטאבים/ניווט
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_BASE_URL}/api/comics`, { signal: ctrl.signal });
        setComics(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error('Error fetching comics:', err);
          setError(err?.message || 'Failed to load comics');
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  // נורמליזציה של כל הנתיבים האפשריים לתמונה → URL מלא
  const buildImageUrl = (rawPath) => {
    if (!rawPath) return null;

    let p = String(rawPath).replace(/\\/g, '/'); // backslashes → slashes

    // אם זה כבר URL מלא (CDN/חיצוני) – החזר כמו שהוא
    if (/^https?:\/\//i.test(p)) return p;

    // המרה מנתיבים ישנים מהלוגים: //root/backend/uploads/... → /uploads/...
    const legacyIdx = p.indexOf('/uploads/');
    if (legacyIdx > -1) p = p.slice(legacyIdx);

    // ודא שמתחיל ב-/uploads
    if (!p.startsWith('/uploads')) {
      if (p.startsWith('uploads')) p = `/${p}`;
      else p = `/uploads/${p.replace(/^\/?uploads\/?/, '')}`;
    }

    // הסרת כפילויות של "//"
    p = p.replace(/\/{2,}/g, '/');

    return `${API_BASE_URL}${p}`;
  };

  // בחירת תמונה לכל קומיקס (coverImage ואז העמוד הראשון)
  const getImageUrl = (comic) => {
    // נסה קודם coverImage אם קיים ב־DB
    const cover = buildImageUrl(comic?.coverImage);
    if (cover) return cover;

    // ואז העמוד הראשון
    const first = comic?.pages?.[0];
    const candidate = first?.url || first?.path || first?.filename;
    const img = buildImageUrl(candidate);

    // fallback אונליין
    return img || 'https://via.placeholder.com/300x400/cccccc/666666?text=No+Image';
  };

  const truncateText = (text, maxLength = 100) =>
    text?.length > maxLength ? text.slice(0, maxLength) + '…' : text || '';

  const handleShowMore = () => setVisibleCount((n) => n + 6);

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!comics?.length) return <div className="no-comics">No comics found</div>;

  return (
    <div className="container mt-5">
      <div className="row">
        {comics.slice(0, visibleCount).map((comic) => (
          <div className="col-md-4" key={comic._id}>
            <Link to={`/comics/${comic._id}`} className="text-decoration-none">
              <div className="card mb-4 comic-card">
                <div className="comic-image-container">
                  <img
                    src={getImageUrl(comic)}
                    className="card-img-top comic-image"
                    alt={comic.title}
                    loading="lazy"
                    onError={(e) => {
                      console.error('Failed to load image for comic:', comic.title);
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://via.placeholder.com/300x400/cccccc/666666?text=No+Image';
                    }}
                  />
                </div>
                <div className="comic-info-box p-3">
                  <h5 className="comic-title text-center">{comic.title}</h5>
                  <p className="comic-description">{truncateText(comic.description)}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {visibleCount < comics.length && (
        <div className="text-center mt-4">
          <button className="btn btn-outline-primary" onClick={handleShowMore}>
            הצג עוד
          </button>
        </div>
      )}
    </div>
  );
};

export default ComicList;
