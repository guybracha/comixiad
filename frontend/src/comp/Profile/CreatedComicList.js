import React from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../Config';

const CreatedComicList = ({ comics, currentUserId, loggedInUserId, onDelete }) => {
  const navigate = useNavigate();

  const handleEdit = (comicId) => {
    navigate(`/comics/edit/${comicId}`);
  };

  const handleView = (comicId) => {
    navigate(`/comics/${comicId}`);
  };

  const userComics = comics.filter(
    (comic) => comic.author?._id === currentUserId
  );

  const isOwnProfile = currentUserId === loggedInUserId;

  return (
    <div>
      <h3>Comics Created</h3>
      {userComics.length === 0 && (
        <p>לא נמצאו קומיקסים שיצרת.</p>
      )}
      <div className="comics-grid">
        {userComics.map((comic) => {
          const imageUrl = comic.pages[0]?.url
            ? `${API_BASE_URL}/${comic.pages[0].url.replace(/\\/g, '/')}`
            : '../../images/placeholder.jpg';

          return (
            <div key={comic._id} className="comic-card">
              <img
                src={imageUrl}
                alt={comic.title}
                className="comic-image"
                style={{ cursor: 'pointer' }}
                onClick={() => handleView(comic._id)}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '../../images/placeholder.jpg';
                }}
              />
              <div className="comic-info">
                <h5>{comic.title}</h5>
                <p>{comic.description}</p>

                {/* כפתורי עריכה ומחיקה רק אם זה המשתמש עצמו */}
                {isOwnProfile && onDelete && (
                  <div className="mt-2">
                    <button
                      className="btn btn-warning me-2"
                      onClick={() => handleEdit(comic._id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => onDelete(comic._id)}
                    >
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
