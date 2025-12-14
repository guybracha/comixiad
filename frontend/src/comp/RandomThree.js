// src/comp/RandomThree.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../Config';
import '../ComicList.css';

function RandomThree() {
  const { t } = useTranslation();
  const [randomComics, setRandomComics] = useState([]);
  const [loading, setLoading] = useState(true);

  // נורמליזציה של נתיב תמונה -> URL מלא
  const buildImageUrl = (rawPath) => {
    if (!rawPath) return null;
    let p = String(rawPath).replace(/\\/g, '/');           // backslashes -> slashes
    
    // ה-API כבר מחזיר URLs מלאים - פשוט החזר אותם
    if (/^https?:\/\//i.test(p)) return p;

    // נתיב יחסי - הוסף את ה-base URL
    return p.startsWith('/') ? `${API_BASE_URL}${p}` : `${API_BASE_URL}/${p}`;
  };

  const comicCover = (comic) => {
    // קודם coverImage אם קיים
    const cover = buildImageUrl(comic?.coverImage);
    if (cover) return cover;

    // אחרת העמוד הראשון
    const first = comic?.pages?.[0];
    const candidate = first?.url || first?.path || first?.filename;
    return buildImageUrl(candidate) || '/images/placeholder.jpg';
  };

  useEffect(() => {
    const ctrl = new AbortController();

    (async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/comics`, { signal: ctrl.signal });
        const list = Array.isArray(data) ? data : [];

        // בחר 3 קומיקסים אקראיים ללא שיכפולים (Fisher-Yates קליל)
        const arr = list.slice();
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        setRandomComics(arr.slice(0, 3));
      } catch (err) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error('Error fetching comics:', err);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, []);

  if (loading) return <div>{t('random.loading')}</div>;
  if (!randomComics.length) return <div>{t('random.none')}</div>;

  return (
    <div className="container my-4">
      <h3 className="mb-3">{t('random.title')}</h3>

      <div className="row g-4">
        {randomComics.map((comic) => {
          const imageUrl = comicCover(comic);
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
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/placeholder.jpg';
                      }}
                    />
                  </div>

                  <div className="comic-info-box p-3 d-flex flex-column">
                    <h5 className="comic-title text-center">{comic.title}</h5>
                    {!!comic.description && (
                      <p className="comic-description">
                        {comic.description.slice(0, 100)}…
                      </p>
                    )}
                    <div className="mt-auto text-center">
                      <span className="btn btn-outline-primary btn-sm">
                        {t('random.readBtn')}
                      </span>
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
}

export default RandomThree;
