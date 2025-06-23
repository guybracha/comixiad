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
  const { t }          = useTranslation();
  const { user }       = useUser();           // ➜ כאן נגלה isAdult
  const location       = useLocation();
  const navigate       = useNavigate();
  const query          = new URLSearchParams(location.search).get('query') || '';
  const [comics,  setComics]  = useState([]);
  const [series,  setSeries]  = useState([]);
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  /* -------------------------------- fetch -------------------------------- */
  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE_URL}/api/search?query=${encodeURIComponent(query)}`
        );
        setComics(data.comics);
        setSeries(data.series);
        setUsers(data.users);
        setError('');
      } catch (err) {
        console.error(err);
        setError(t('search.error'));
      } finally {
        setLoading(false);
      }
    };
    fetchSearchResults();
  }, [query, t]);

  /* ----------------------------- helper fn ------------------------------- */
  const filterAdult = (item) =>
    !item.adultOnly || user?.isAdult; // מציג אם לא 18+ או שהמשתמש בגיר

  if (loading) return <div>{t('search.loading')}</div>;
  if (error)   return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2>
        {t('search.resultsFor', { query })}
      </h2>

      {/* ------------ COMICS ------------- */}
      <h3>{t('search.comics')}</h3>
      <div className="results-section">
        <div className="results-grid">
          {comics.filter(filterAdult).map((c) => (
            <div key={c._id} className="result-card">
              <img
                src={
                  c.pages?.[0]?.url
                    ? `${API_BASE_URL}/${c.pages[0].url.replace(/\\/g, '/')}`
                    : '/images/placeholder.jpg'
                }
                alt={c.title}
                className="result-image"
              />
              <div className="card-body">
                <h5>{c.title} {c.adultOnly && '🔞'}</h5>
                <p>{c.description}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/comics/${c._id}`)}
                >
                  {t('search.viewComic')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ------------ SERIES ------------- */}
      <h3>{t('search.series')}</h3>
      <div className="results-section">
        <div className="results-grid">
          {series.filter(filterAdult).map((s) => (
            <div key={s._id} className="result-card">
              <img
                src={
                  s.coverImage
                    ? `${API_BASE_URL}/uploads/${s.coverImage}`
                    : '/images/placeholder.jpg'
                }
                alt={s.name}
                className="result-image"
              />
              <div className="card-body">
                <h5>{s.name} {s.adultOnly && '🔞'}</h5>
                <p>{s.description}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/series/${s._id}`)}
                >
                  {t('search.viewSeries')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ------------ USERS ------------- */}
      <h3>{t('search.users')}</h3>
      <div className="results-section">
        <div className="results-grid">
          {users.map((u) => (
            <div key={u._id} className="result-card">
              <img
                src={
                  u.avatar?.startsWith('http')
                    ? u.avatar
                    : u.avatar
                    ? `${API_BASE_URL}/${u.avatar.replace(/\\/g, '/')}`
                    : 'https://www.gravatar.com/avatar/?d=mp'
                }
                alt={u.username}
                className="result-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://www.gravatar.com/avatar/?d=mp';
                }}
              />
              <div className="card-body">
                <h5>{u.username}</h5>
                <p>{u.bio}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/profile/${u._id}`)}
                >
                  {t('search.viewProfile')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <RandomThree />
    </div>
  );
}

export default SearchResults;
