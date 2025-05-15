import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ComicList from './ComicList';
import genres from '../config/Genres';
import { Helmet } from 'react-helmet';

function CategoryPage() {
  const { category } = useParams();
  const [comics, setComics] = useState([]);
  const [filteredComics, setFilteredComics] = useState([]);
  const [loading, setLoading] = useState(true);

  // מציאת שם הקטגוריה בעברית
  const displayName = genres.find(g => g.id === category)?.label || category;

  useEffect(() => {
    async function fetchComics() {
      try {
        const response = await fetch('/api/comics');
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
        if (Array.isArray(genreField)) {
          return genreField.map(g => g.toLowerCase()).includes(category.toLowerCase());
        } else if (typeof genreField === 'string') {
          return genreField.toLowerCase() === category.toLowerCase();
        }
        return false;
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

      <h1>קטגוריה: {displayName}</h1>

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
