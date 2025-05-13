import React from 'react';

const CreatedSeriesList = ({ series, currentUserId, onDelete }) => (
  <div>
    <h3>Series Created</h3>
    <div className="comics-grid">
      {series.map((s) => (
        <div key={s._id} className="series-card">
          <img
            src={`http://localhost:5000/${s.coverImage.replace(/\\/g, '/')}`}
            alt={s.name}
            className="series-image"
            onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.jpg'; }}
          />
          <div className="series-info">
            <h5>{s.name}</h5>
            <p>{s.description}</p>
            {s.author === currentUserId && (
              <button className="btn btn-danger" onClick={() => onDelete(s._id)}>
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CreatedSeriesList;
