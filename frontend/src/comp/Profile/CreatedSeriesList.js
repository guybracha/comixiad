// src/comp/Profile/CreatedSeriesList.js
import React from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../Config';

const PLACEHOLDER = 'https://via.placeholder.com/640x360?text=Series+Cover';
const API = (API_BASE_URL || '').replace(/\/+$/, '');

function toAbsoluteUploadUrl(relOrAbs) {
  if (!relOrAbs) return '';
  if (/^https?:\/\//i.test(relOrAbs)) return relOrAbs;

  let p = String(relOrAbs)
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\/+/, '');

  if (!/^uploads\//i.test(p)) p = `uploads/${p}`;
  return `${API}/${p}`;
}

export default function CreatedSeriesList({
  series = [],
  currentUserId,
  loggedInUserId,
  onDelete,
}) {
  const list = Array.isArray(series) ? series : series?.data ?? [];
  if (!Array.isArray(list) || list.length === 0) {
    return <div className="text-muted">אין עדיין סדרות שפורסמו.</div>;
  }

  return (
    <div className="row g-3">
      {list.map((s) => {
        const img = s.coverImage ? toAbsoluteUploadUrl(s.coverImage) : PLACEHOLDER;
        const viewLink = `/series/${s.slug || s._id}`;
        const editLink = `/series/${s._id}/edit`; // 👈 מתאים ל־Route שלך

        return (
          <div key={s._id || s.id} className="col-6 col-md-4 col-lg-3">
            <div className="card h-100 shadow-sm">
              <Link to={viewLink} className="text-decoration-none">
                <img
                  src={img}
                  alt={s.name || s.title || 'Series cover'}
                  className="card-img-top img-fluid"
                  loading="lazy"
                  onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                  style={{ aspectRatio: '16/9', objectFit: 'cover' }}
                />
              </Link>

              <div className="card-body d-flex flex-column">
                <h6 className="card-title mb-2">
                  <Link to={viewLink} className="stretched-link text-reset">
                    {s.name || s.title || 'Untitled'}
                  </Link>
                </h6>

                {loggedInUserId === currentUserId && (
                  <div className="d-flex justify-content-between mt-auto">
                    {/* 👇 כפתור עריכה מוביל ל־/series/:seriesId/edit */}
                    <Link to={editLink} className="btn btn-sm btn-outline-primary">
                      עריכה
                    </Link>

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
