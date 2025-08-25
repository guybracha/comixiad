import React from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../Config';

const CreatedComicList = ({ comics = [], currentUserId, loggedInUserId, onDelete }) => {
  const navigate = useNavigate();

  const handleEdit = (comicId) => navigate(`/comics/edit/${comicId}`);
  const handleView = (comicId) => navigate(`/comics/${comicId}`);

  // --- normalize image paths to full URL ---
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

  const comicCover = (comic) => {
    const cover = buildImageUrl(comic?.coverImage);
    if (cover) return cover;

    const first = comic?.pages?.[0];
    const candidate = first?.url || first?.path || first?.filename;
    return buildImageUrl(candidate) || '/images/placeholder.jpg';
  };

  // author יכול להיות אובייקט או מחרוזת id
  const toId = (a) => (typeof a === 'object' ? a?._id : a);
  const userComics = comics.filter((c) => toId(c.author) === currentUserId);

  const isOwnProfile = currentUserId === loggedInUserId;

  return (
    <div>
      <h3>Comics Created</h3>
      {userComics.length === 0 && <p>לא נמצאו קומיקסים שיצרת.</p>}

      <div className="comics-grid">
        {userComics.map((comic) => {
          const imageUrl = comicCover(comic);

          return (
            <div key={comic._id} className="comic-card">
              <img
                src={imageUrl}
                alt={comic.title}
                className="comic-image"
                style={{ cursor: 'pointer' }}
                loading="lazy"
                onClick={() => handleView(comic._id)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/placeholder.jpg';
                }}
              />

              <div className="comic-info">
                <h5>{comic.title}</h5>
                <p>{comic.description}</p>

                {isOwnProfile && onDelete && (
                  <div className="mt-2">
                    <button className="btn btn-warning me-2" onClick={() => handleEdit(comic._id)}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => onDelete(comic._id)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CreatedComicList;
