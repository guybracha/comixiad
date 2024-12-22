import React, { useState, useEffect } from 'react';

const ComicList = () => {
  // Define error state and loading state
  const [error, setError] = useState(null);
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state to show a loading indicator

  useEffect(() => {
    const fetchComics = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/comics'); // Correct API URL for fetching comics
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setComics(data); // Assuming the API returns a list of comics
      } catch (error) {
        console.error('Error fetching comics:', error);
        setError('There was an error fetching comics. Please try again later.');
      } finally {
        setLoading(false); // Stop loading once the request is done
      }
    };

    fetchComics();
  }, []); // Empty dependency array to fetch comics only once

  return (
    <div className='container'>
      <h1>Comic List</h1>
      {loading && <div>Loading...</div>} {/* Show loading state while data is being fetched */}
      {error && <div style={{ color: 'red' }}>{error}</div>} {/* Display error message */}
      {/* Display comics list here */}
      <ul>
        {comics.length > 0 ? (
          comics.map((comic) => (
            <li key={comic._id}>{comic.title}</li>
          ))
        ) : (
          <li>No comics available</li> // If no comics are available
        )}
      </ul>
    </div>
  );
};

export default ComicList;
