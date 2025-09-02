// src/comp/Profile/CreatedSeriesList.js
import React from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../Config';

const PLACEHOLDER = 'https://via.placeholder.com/640x360?text=Series+Cover';

function firstGuessUrl(filename) {
  if (!filename) return '';
  if (/^https?:\/\//i.test(filename)) return filename; // כבר מוחלט
  // ניסיון 1: בתוך /uploads/series/
  const clean = filename.replace(/^\/+/, '');
  return `${API_BASE_URL}/uploads/series/${clean}`;
}

function secondGuessUrl(filename) {
  if (!filename) return '';
  if (/^https?:\/\//i.test(filename)) return filename;
  // ניסיון 2: ישר תחת /uploads/
  const clean = filename.replace(/^\/+/, '');
  return `${API_BASE_URL}/uploads/${clean}`;
}

export default function CreatedSeriesList({
  series = [],
  currentUserId,
  loggedInUserId,
  onDelete,
}) {
  const list = Array.isArray(series) ? series : series?.data ?? [];
  if (!Array.isArray(list) || list.length === 0) {
    return <div className="text-muted">אין עדיין סדרות שנוצרו.</div>;
  }

  return (
    <div className="row g-3">
      {list.map((s) => {
        const linkTo = `/series/${s.slug || s._id}`;
        const primary = firstGuessUrl(s.coverImage);
        const secondary = secondGuessUrl(s.coverImage);

        return (
          <div key={s._id || s.id} className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm">
              <Link to={linkTo} className="text-decoration-none">
                <img
                  src={primary || PLACEHOLDER}
                  alt={s.title || s.name || 'Series cover'}
                  className="card-img-top img-fluid"
                  loading="lazy"
                  style={{ aspectRatio: '16/9', objectFit: 'cover' }}
                  // אם הניסיון הראשון נכשל – ננסה שנית, ואז פלייסהולדר
                  onError={(e) => {
                    const el = e.currentTarget;
                    if (!el.dataset.altTried && secondary && el.src !== secondary) {
                      el.dataset.altTried = '1';
                      el.src = secondary;
                    } else {
                      el.src = PLACEHOLDER;
                    }
                  }}
                />
              </Link>

              <div className="card-body d-flex flex-column">
                <h6 className="card-title mb-2">
                  <Link to={linkTo} className="stretched-link text-reset">
                    {s.title || s.name || 'Untitled'}
                  </Link>
                </h6>

                {loggedInUserId === currentUserId && onDelete && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger mt-auto"
                    onClick={() => onDelete(s._id)}
                  >
                    מחיקה
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
