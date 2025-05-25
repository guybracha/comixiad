import React from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../Config';

const CreatedSeriesList = ({ series, currentUserId, loggedInUserId, onDelete }) => {
  const navigate = useNavigate();
  const isOwnProfile = currentUserId === loggedInUserId;

  const userSeries = series.filter(s => {
    const authorId = typeof s.author === 'string' ? s.author : s.author?._id;
    return authorId === currentUserId;
  });

  const handleEdit = (seriesId) => {
    navigate(`/series/edit/${seriesId}`);
  };

  const handleView = (seriesId) => {
    navigate(`/series/${seriesId}`);
  };

  return (
    <div>
      <h3>Series Created</h3>
      {userSeries.length === 0 && (
        <p>לא נמצאו סדרות שיצרת.</p>
      )}

      <div className="row g-4">
        {userSeries.map((s) => {
          const imageUrl = s.coverImage
            ? `${API_BASE_URL}/uploads/${s.coverImage.replace(/\\/g, '/')}`
            : '/images/placeholder.jpg';

          return (
            <div key={s._id} className="col-sm-6 col-md-4 col-lg-3">
              <div className="card h-100">
                <img
                  src={imageUrl}
                  className="card-img-top"
                  alt={s.name}
                  style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => handleView(s._id)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
                <div className="card-body">
                  <h5 className="card-title">{s.name}</h5>
                  <p className="card-text">{s.description}</p>

                  {isOwnProfile && (
                    <div className="d-flex justify-content-between">
                      <button className="btn btn-warning btn-sm" onClick={() => handleEdit(s._id)}>
                        ערוך
                      </button>
                      {onDelete && (
                        <button className="btn btn-danger btn-sm" onClick={() => onDelete(s._id)}>
                          מחק
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
    </div>
  );
};

export default CreatedSeriesList;
