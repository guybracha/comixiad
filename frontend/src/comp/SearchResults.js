// src/comp/SearchResults.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { API_BASE_URL } from '../Config';
import RandomThree from './RandomThree';
import '../SearchResults.css';

function SearchResults() {
  const { t } = useTranslation();
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search).get('query') || '';

  const [comics, setComics] = useState([]);
  const [series, setSeries] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ---- helpers: normalize image URLs ----
  const buildImageUrl = (rawPath) => {
    if (!rawPath) return null;
    let p = String(rawPath).replace(/\\/g, '/');               // \ -> /

    if (/^https?:\/\//i.test(p)) return p;                     // already absolute URL

    // strip legacy prefixes like //root/backend/uploads/...
    const idx = p.indexOf('/uploads/');
    if (idx > -1) p = p.slice(idx);

    if (!p.startsWith('/uploads')) {
      if (p.startsWith('uploads')) p = `/${p}`;
      else p = `/uploads/${p.replace(/^\/?uploads\/?/, '')}`;
    }

    p = p.replace(/\/{2,}/g, '/');                             // collapse //
    return `${API_BASE_URL}${p}`;
  };

  const comicImage = (c) => {
    // prefer coverImage if your schema stores it
    const cover = buildImageUrl(c?.coverImage);
    if (cover) return cover;

    const first = c?.pages?.[0];
    const candidate = first?.url || first?.path || first?.filename;
    return buildImageUrl(candidate) || '/images/placeholder.jpg';
  };

  const seriesImage = (s) => buildImageUrl(s?.coverImage) || '/images/placeholder.jpg';

  const userAvatar = (u) => {
    if (!u?.avatar) return 'https://www.gravatar.com/avatar/?d=mp';
    if (String(u.avatar).startsWith('http')) return u.avatar;
    return buildImageUrl(u.avatar) || 'https://www.gravatar.com/avatar/?d=mp';
  };

  // ---- fetch ----
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${API_BASE_URL}/api/search?query=${encodeURIComponent(query)}`,
          { signal: ctrl.signal }
        );
        setComics(Array.isArray(data?.comics) ? data.comics : []);
        setSeries(Array.isArray(data?.series) ? data.series : []);
        setUsers(Array.isArray(data?.users) ? data.users : []);
        setError('');
      } catch (err) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error(err);
          setError(t('search.error'));
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [query, t]);

  // ---- adult filter ----
  const filterAdult = (item) => !item?.adultOnly || user?.isAdult;

  if (loading) return <div>{t('search.loading')}</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2>{t('search.resultsFor', { query })}</h2>

      {/* COMICS */}
      <h3 className="mt-4">{t('search.comics')}</h3>
      <div className="results-section">
        <div className="results-grid">
          {comics.filter(filterAdult).map((c) => (
            <div key={c._id} className="result-card">
              <img
                src={comicImage(c)}
                alt={c.title}
                className="result-image"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/placeholder.jpg';
                }}
              />
              <div className="card-body">
                <h5>
                  {c.title} {c.adultOnly && '🔞'}
                </h5>
                <p>{c.description}</p>
                <button className="btn btn-primary" onClick={() => navigate(`/comics/${c._id}`)}>
                  {t('search.viewComic')}
                </button>
              </div>
            </div>
          ))}
          {comics.filter(filterAdult).length === 0 && <div>{t('search.noneComics')}</div>}
        </div>
      </div>

      {/* SERIES */}
      <h3 className="mt-4">{t('search.series')}</h3>
      <div className="results-section">
        <div className="results-grid">
          {series.filter(filterAdult).map((s) => (
            <div key={s._id} className="result-card">
              <img
                src={seriesImage(s)}
                alt={s.name}
                className="result-image"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/placeholder.jpg';
                }}
              />
              <div className="card-body">
                <h5>
                  {s.name} {s.adultOnly && '🔞'}
                </h5>
                <p>{s.description}</p>
                <button className="btn btn-primary" onClick={() => navigate(`/series/${s._id}`)}>
                  {t('search.viewSeries')}
                </button>
              </div>
            </div>
          ))}
          {series.filter(filterAdult).length === 0 && <div>{t('search.noneSeries')}</div>}
        </div>
      </div>

      {/* USERS */}
      <h3 className="mt-4">{t('search.users')}</h3>
      <div className="results-section">
        <div className="results-grid">
          {users.map((u) => (
            <div key={u._id} className="result-card">
              <img
                src={userAvatar(u)}
                alt={u.username}
                className="result-image"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://www.gravatar.com/avatar/?d=mp';
                }}
              />
              <div className="card-body">
                <h5>{u.username}</h5>
                <p>{u.bio}</p>
                <button className="btn btn-primary" onClick={() => navigate(`/profile/${u._id}`)}>
                  {t('search.viewProfile')}
                </button>
              </div>
            </div>
          ))}
          {users.length === 0 && <div>{t('search.noneUsers')}</div>}
        </div>
      </div>

      <RandomThree />
    </div>
  );
}

export default SearchResults;
