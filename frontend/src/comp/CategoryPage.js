import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ComicList from './ComicList';
import genres from '../config/Genres';
import { Helmet } from 'react-helmet';
import { API_BASE_URL } from '../Config';

function CategoryPage() {
  const { category } = useParams(); // לדוגמה: "comedy"
  const [comics, setComics] = useState([]);
  const [filteredComics, setFilteredComics] = useState([]);
  const [loading, setLoading] = useState(true);

  // מציאת שם הקטגוריה בעברית והאימוג'י
  const genreInfo = genres.find(g => g.id === category);
  const displayName = genreInfo?.label || category;
  const displayEmoji = genreInfo?.emoji || '';

  useEffect(() => {
    async function fetchComics() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/comics`);
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
      const filtered = comics.filter((comic) => {
        const genreField = comic.genre;

        if (!genreField) return false;

        // הפוך את genre למערך אם הוא מחרוזת
        const genreArray = Array.isArray(genreField)
          ? genreField
          : [genreField];

        return genreArray.some(g => g.toLowerCase() === category.toLowerCase());
      });

      setFilteredComics(filtered);
    }
  }, [comics, category]);


  return (
    <div className='container'>
      <Helmet>
        <title>Comixiad - {displayName}</title>
        <meta name="description" content={`קומיקסים בקטגוריה: ${displayName}`} />
      </Helmet>

      <h1>קטגוריה: {displayEmoji} {displayName}</h1>

      {loading ? (
        <p>טוען נתונים...</p>
      ) : filteredComics.length > 0 ? (
        <ComicList comics={filteredComics} />
      ) : (
        <p>לא נמצאו קומיקסים בקטגוריה זו.</p>
      )}
    </div>
  );
}

export default CategoryPage;
