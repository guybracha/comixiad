import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ComicList from './ComicList'; // קומפוננטה להצגת קומיקס

function CategoryPage() {
  const { category } = useParams(); // שליפת שם הקטגוריה מה-URL
  const [comics, setComics] = useState([]);
  const [filteredComics, setFilteredComics] = useState([]);
  const [loading, setLoading] = useState(true); // מצב טעינה

  useEffect(() => {
    async function fetchComics() {
      try {
        const response = await fetch('/api/comics'); // עדכן לפי ה-API האמיתי
        if (!response.ok) throw new Error('Failed to fetch comics');
        const data = await response.json();
        setComics(data);
      } catch (error) {
        console.error('Error fetching comics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchComics();
  }, []);

  useEffect(() => {
    if (comics.length > 0) {
      const filtered = comics.filter((comic) => comic.genre.toLowerCase() === category.toLowerCase());
      setFilteredComics(filtered);
    }
  }, [comics, category]);

  return (
    <div className='container'>
      <h1>קטגוריה: {category}</h1>
      {loading ? (
        <p>טוען נתונים...</p>
      ) : filteredComics.length > 0 ? (
        <ComicList comics={filteredComics} />
      ) : (
        <p>לא נמצאו קומיקס בקטגוריה זו.</p>
      )}
    </div>
  );
}

export default CategoryPage;
