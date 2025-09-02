// src/comp/Profile/CreatedSeriesList.js
import React from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../Config';

const PLACEHOLDER = 'https://via.placeholder.com/640x360?text=Series+Cover';

function toAbsoluteUrl(relOrAbs) {
  if (!relOrAbs) return '';
  if (/^https?:\/\//i.test(relOrAbs)) return relOrAbs;
  const clean = relOrAbs.startsWith('/') ? relOrAbs.slice(1) : relOrAbs;
  return `${API_BASE_URL}/${clean}`;
}

export default function CreatedSeriesList({
  series = [],
  currentUserId,
  loggedInUserId,
  onDelete, // אופציונלי למחיקה
}) {
  const list = Array.isArray(series) ? series : series?.data ?? [];
  if (!Array.isArray(list) || list.length === 0) {
    return <div className="text-muted">אין עדיין סדרות שפורסמו.</div>;
  }

  return (
    <div className="row g-3">
      {list.map((s) => {
        const img = s.coverImage ? toAbsoluteUrl(s.coverImage) : PLACEHOLDER;
        const viewLink = `/series/${s.slug || s._id}`;
        const editLink = `/series/${s._id}/edit`; // 👈 כאן הקישור לעריכת סדרה

        return (
          <div key={s._id || s.id} className="col-6 col-md-4 col-lg-3">
            <div className="card h-100 shadow-sm">
              <Link to={viewLink} className="text-decoration-none">
                <img
                  src={img}
                  alt={s.title || 'Series cover'}
                  className="card-img-top img-fluid"
                  loading="lazy"
                  onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                  style={{ aspectRatio: '16/9', objectFit: 'cover' }}
                />
              </Link>

              <div className="card-body d-flex flex-column">
                <h6 className="card-title mb-2">
                  <Link to={viewLink} className="stretched-link text-reset">
                    {s.title || 'Untitled'}
                  </Link>
                </h6>

                {loggedInUserId === currentUserId && (
                  <div className="d-flex justify-content-between mt-auto">
                    {/* עריכה */}
                    <Link to={editLink} className="btn btn-sm btn-outline-primary">
                      עריכה
                    </Link>

                    {/* מחיקה (אם הועבר handler) */}
                    {onDelete && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(s._id)}
                      >
                        מחיקה
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
