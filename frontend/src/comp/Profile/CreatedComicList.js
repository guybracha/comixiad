// src/comp/Profile/CreatedComicList.js
import React from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../Config';

const PLACEHOLDER = 'https://via.placeholder.com/640x900?text=Comic+Cover';

function toAbsoluteUrl(relOrAbs) {
  if (!relOrAbs) return '';
  if (/^https?:\/\//i.test(relOrAbs)) return relOrAbs;
  // הסר / כפולים
  const clean = relOrAbs.startsWith('/') ? relOrAbs.slice(1) : relOrAbs;
  return `${API_BASE_URL}/${clean}`;
}

export default function CreatedComicList({
  comics = [],
  currentUserId,
  loggedInUserId,
  onDelete,
}) {
  const list = Array.isArray(comics) ? comics : comics?.data ?? [];
  if (!Array.isArray(list) || list.length === 0) {
    return <div className="text-muted">אין עדיין קומיקס שפורסם.</div>;
  }

  return (
    <div className="row g-3">
      {list.map((c) => {
        const img = c.coverImage ? toAbsoluteUrl(c.coverImage) : PLACEHOLDER;
        const linkTo = `/comic/${c.slug || c._id}`;
        return (
          <div key={c._id || c.id} className="col-6 col-md-4 col-lg-3">
            <div className="card h-100 shadow-sm">
              <Link to={linkTo} className="text-decoration-none">
                <img
                  src={img}
                  alt={c.title || 'Comic cover'}
                  className="card-img-top img-fluid"
                  loading="lazy"
                  onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                  style={{ aspectRatio: '2/3', objectFit: 'cover' }}
                />
              </Link>
              <div className="card-body d-flex flex-column">
                <h6 className="card-title mb-2">
                  <Link to={linkTo} className="stretched-link text-reset">
                    {c.title || 'Untitled'}
                  </Link>
                </h6>
                {(loggedInUserId === currentUserId) && onDelete && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger mt-auto"
                    onClick={() => onDelete(c._id)}
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
