import React, { useEffect, useState } from 'react';

const ComicList = () => {
  const [comics, setComics] = useState([]); // Start with an empty array

  useEffect(() => {
    fetch('http://localhost:5000/api/comics')
      .then(response => response.json())
      .then(data => {
        const comicWithImage = data.map(comic => {
          // Construct the URL to fetch the image from the /image/:comicId route
          const imageUrl = `http://localhost:5000/image/${comic._id}`; // Use comic ID to fetch image
          return { ...comic, imageUrl }; // Add imageUrl to the comic object
        });
        setComics(comicWithImage);
      })
      .catch(error => console.error('Error fetching comics:', error));
  }, []);

  return (
    <div>
      {comics && comics.length > 0 ? (
        comics.map((comic) => (
          <div key={comic._id}>
            <h3>{comic.title}</h3>
            <p>{comic.description}</p>
            {comic.imageUrl ? (
              <img src={comic.imageUrl} alt={comic.title} style={{ width: '100px', height: 'auto' }} />
            ) : (
              <img src="default-image-url.jpg" alt="Default Comic" style={{ width: '100px', height: 'auto' }} />
            )}
          </div>
        ))
      ) : (
        <p>No comics available.</p>
      )}
    </div>
  );
};

export default ComicList;
