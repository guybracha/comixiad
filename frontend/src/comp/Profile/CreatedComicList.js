import React from 'react';

const CreatedComicList = ({ comics, currentUserId, onDelete }) => (
    <div>
        <h3>Comics Created</h3>
        <div className="comics-grid">
            {comics.map((comic) => (
                <div key={comic._id} className="comic-card">
                    <img
                        src={`http://localhost:5000/uploads/${comic.pages[0]?.url}`}
                        alt={comic.title}
                        className="comic-image"
                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.jpg'; }}
                    />
                    <div className="comic-info">
                        <h5>{comic.title}</h5>
                        <p>{comic.description}</p>
                        {comic.author === currentUserId && (
                            <button className="btn btn-danger" onClick={() => onDelete(comic._id)}>
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default CreatedComicList;
