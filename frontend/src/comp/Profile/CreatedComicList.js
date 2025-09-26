// src/comp/Profile/CreatedComicList.js
import React from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../Config';

const PLACEHOLDER = 'https://via.placeholder.com/640x900?text=Comic+Cover';

function toAbsoluteUrl(relOrAbs) {
  if (!relOrAbs) return '';
  if (/^https?:\/\//i.test(relOrAbs)) return relOrAbs;
  const clean = relOrAbs.startsWith('/') ? relOrAbs.slice(1) : relOrAbs;
  return `${API_BASE_URL}/${clean}`; // אם התמונות נשמרות כנתיב יחסי, ודא שהוא כולל uploads/
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
        const linkTo = `/comics/${c.slug || c._id}`;
        const editLink = `/comics/${c._id}/edit`;

        // בדיקת בעלות – התאם לשדה אצלך (author/userId/ownerId)
        const isOwner =
          String(c.author?._id || c.userId || c.ownerId) === String(loggedInUserId);

        return (
          <div key={c._id || c.id} className="col-6 col-md-4 col-lg-3">
            <div className="card h-100 shadow-sm">
              {/* תמונה ולינק לעמוד הקומיקס */}
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
                {/* כותרת – בלי stretched-link כדי לא “לבלוע” לחיצות אחרות */}
                <h6 className="card-title mb-2">
                  <Link to={linkTo} className="text-reset">
                    {c.title || 'Untitled'}
                  </Link>
                </h6>

                {isOwner && (
                  <div className="d-flex justify-content-between mt-auto">
                    {/* כפתור עריכה */}
                    <Link
                      to={editLink}
                      className="btn btn-sm btn-outline-primary"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="עריכת קומיקס"
                    >
                      עריכה
                    </Link>

                    {/* כפתור מחיקה */}
                    {onDelete && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(c._id);
                        }}
                        aria-label="מחיקת קומיקס"
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
