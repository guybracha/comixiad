import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ComicList = () => {
  const [comics, setComics] = useState([]);

  useEffect(() => {
    const fetchComics = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/comics');
        setComics(response.data);
      } catch (error) {
        console.error('Error fetching comics:', error);
      }
    };

    fetchComics();
  }, []);

  return (
    <div className="container mt-5">
      <h2>Comic List</h2>
      <div className="row">
        {comics.map((comic) => (
          <div className="col-md-4" key={comic._id}>
            <div className="card mb-4">
              <img
                src={`http://localhost:5000/uploads/${comic.coverImage}`}
                className="card-img-top"
                alt={comic.title}
              />
              <div className="card-body">
                <h5 className="card-title">{comic.title}</h5>
                <p className="card-text">{comic.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComicList;