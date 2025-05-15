import React from 'react';
import { useNavigate } from 'react-router-dom';

const CreatedComicList = ({ comics, currentUserId, onDelete }) => {
  const navigate = useNavigate();

  const handleEdit = (comicId) => {
    navigate(`/comics/edit/${comicId}`);
  };

  const handleView = (comicId) => {
    navigate(`/comics/${comicId}`);
  };

  return (
    <div>
      <h3>Comics Created</h3>
      <div className="comics-grid">
        {comics.map((comic) => (
          <div key={comic._id} className="comic-card">
            <img
              src={`http://localhost:5000/${comic.pages[0]?.url.replace(/\\/g, '/')}`}
              alt={comic.title}
              className="comic-image"
              style={{ cursor: 'pointer' }}
              onClick={() => handleView(comic._id)}
            />
            <div className="comic-info">
              <h5>{comic.title}</h5>
              <p>{comic.description}</p>
              {(comic.author === currentUserId || comic.author?._id === currentUserId) && (
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
        ))}
      </div>
    </div>
  );
};

export default CreatedComicList;
