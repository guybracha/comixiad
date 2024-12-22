import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ComicList = () => {
  const [comics, setComics] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/comics')
      .then((res) => {
        setComics(res.data.comics);
      })
      .catch((err) => {
        console.error('Error fetching comics:', err);
      });
  }, []);

  return (
    <div className="container mt-4">
      <h2>Comics</h2>
      <div className="row">
        {comics.map((comic) => (
          <div className="col-md-6 mb-4" key={comic._id}>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{comic.title}</h5>
                <p className="card-text">{comic.description}</p>
                <p><strong>Genre:</strong> {comic.genre}</p>
                <p><strong>Language:</strong> {comic.language}</p>
                <div>
                  <h6>Pages:</h6>
                  {comic.pages.map((page, index) => (
                    <img
                      key={index}
                      src={`http://localhost:5000/${page.path}`}
                      alt={`Page ${index + 1}`}
                      className="img-fluid mb-2"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComicList;
