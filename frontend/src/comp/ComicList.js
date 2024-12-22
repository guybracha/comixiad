import React, { useState, useEffect } from 'react';

const ComicList = () => {
  const [error, setError] = useState(null);
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComics = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/comics');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setComics(data);
      } catch (error) {
        console.error('Error fetching comics:', error);
        setError('There was an error fetching comics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchComics();
  }, []);
  

  return (
    <div className="container">
      <h1>Comic List</h1>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      
      <div className="row">
        {comics.length > 0 ? (
          comics.map((comic) => (
            <div key={comic._id} className="col-md-4 mb-4"> {/* כל קולום יהיה בגודל של 4 מתוך 12 */}
              <div className="card">
                <img
                  src={`http://localhost:5000${comic.pages[0]?.url}`} // הוספת הכתובת המלאה של השרת
                  alt={`${comic.title} cover`}
                  className="card-img-top"
                  style={{ width: '100%', height: 'auto' }}
                />
                <div className="card-body">
                  <h5 className="card-title">{comic.title}</h5>
                  <p className="card-text">{comic.description}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">No comics available</div>
        )}
      </div>
    </div>
  );
};

export default ComicList;
