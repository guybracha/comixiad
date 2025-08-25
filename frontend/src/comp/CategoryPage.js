// src/comp/CategoryPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import genres from '../config/Genres';
import { API_BASE_URL } from '../Config';
import '../ComicList.css';

function CategoryPage() {
  const { category } = useParams(); // לדוגמה: "comedy"
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // מצא את העצם בז'אנרים (אין label ברשימה – ניקח emoji ושם מחושב)
  const genreInfo    = genres.find(g => g.id === category);
  const displayEmoji = genreInfo?.emoji || '';
  const displayName  = useMemo(() => {
    if (!genreInfo) return category;
    // אם אין i18n, נציג Title Case באנגלית מה-id
    return genreInfo.id.replace(/(^|[-_])(\w)/g, (_, __, c) => c.toUpperCase());
  }, [genreInfo, category]);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/comics`, { signal: ctrl.signal });
        if (!res.ok) throw new Error('Failed to fetch comics');
        const data = await res.json();
        setComics(Array.isArray(data) ? data : []);
        setError('');
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching comics:', err);
          setError('שגיאה בטעינת קומיקסים');
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  // --- עזר: נרמל ז'אנרים לכל קומיקס למערך ids באותיות קטנות ---
  const normalizeGenres = (g) => {
    if (!g) return [];
    // מערך של מחרוזות/אובייקטים
    if (Array.isArray(g)) {
      return g
        .map(x => {
          if (!x) return null;
          if (typeof x === 'string') return x;
          if (typeof x === 'object') return x.id || x.name || x.label || '';
          return '';
        })
        .filter(Boolean)
        .flatMap(s => String(s)
          .split(',')
          .map(t => t.trim().toLowerCase()));
    }
    // מחרוזת אחת (כולל "action, comedy")
    if (typeof g === 'string') {
      return g.split(',').map(s => s.trim().toLowerCase());
    }
    // אובייקט יחיד עם id/name/label
    if (typeof g === 'object') {
      const val = g.id || g.name || g.label || '';
      return val ? [String(val).toLowerCase()] : [];
    }
    return [];
  };

  // --- עזר: בניית URL לתמונה ---
  const buildImageUrl = (rawPath) => {
    if (!rawPath) return null;
    let p = String(rawPath).replace(/\\/g, '/');
    if (/^https?:\/\//i.test(p)) return p;
    const idx = p.indexOf('/uploads/');
    if (idx > -1) p = p.slice(idx);
    if (!p.startsWith('/uploads')) {
      if (p.startsWith('uploads')) p = `/${p}`;
      else p = `/uploads/${p.replace(/^\/?uploads\/?/, '')}`;
    }
    p = p.replace(/\/{2,}/g, '/');
    return `${API_BASE_URL}${p}`;
  };

  // סינון לפי הקטגוריה מתוך ה־URL (id מהרשימה)
  const filteredComics = useMemo(() => {
    const wanted = String(category || '').toLowerCase();
    if (!wanted) return [];
    return comics.filter(c => normalizeGenres(c.genre).includes(wanted));
  }, [comics, category]);

  if (loading) return <div className="container"><p>טוען נתונים...</p></div>;
  if (error)   return <div className="container"><p className="alert alert-danger">{error}</p></div>;

  return (
    <div className="container">
      <Helmet>
        <title>Comixiad - {displayName}</title>
        <meta name="description" content={`קומיקסים בקטגוריה: ${displayName}`} />
      </Helmet>

      <h1>קטגוריה: {displayEmoji} {displayName}</h1>

      {filteredComics.length === 0 ? (
        <p>לא נמצאו קומיקסים בקטגוריה זו.</p>
      ) : (
        <div className="row mt-4">
          {filteredComics.map((comic) => {
            const cover =
              buildImageUrl(comic?.coverImage) ||
              buildImageUrl(comic?.pages?.[0]?.url || comic?.pages?.[0]?.path || comic?.pages?.[0]?.filename) ||
              '/images/placeholder.jpg';

            return (
              <div key={comic._id} className="col-md-4">
                <Link to={`/comics/${comic._id}`} className="text-decoration-none">
                  <div className="card mb-4 comic-card">
                    <div className="comic-image-container">
                      <img
                        src={cover}
                        alt={comic.title}
                        className="card-img-top comic-image"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/placeholder.jpg';
                        }}
                      />
                    </div>
                    <div className="comic-info-box p-3">
                      <h5 className="comic-title text-center">{comic.title}</h5>
                      <p className="comic-description">
                        {comic.description?.length > 100
                          ? comic.description.slice(0, 100) + '…'
                          : comic.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CategoryPage;
