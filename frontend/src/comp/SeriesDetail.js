import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from './Config';
import '../SeriesDetail.css';
import { useUser } from '../context/UserContext';

const SeriesDetail = () => {
  const { id } = useParams();
  const { user } = useUser();
  const [series, setSeries] = useState(null);
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // מושך רק את פרטי הסדרה
        const seriesResponse = await axios.get(`${API_BASE_URL}/api/series/${id}`);
        setSeries(seriesResponse.data);
    
        // מנסה למשוך קומיקסים רק אם הנתיב קיים
        let comicsData = [];
        try {
          const comicsResponse = await axios.get(`${API_BASE_URL}/api/series/${id}/comics`);
          comicsData = comicsResponse.data;
        } catch (comicsErr) {
          console.warn('Comics not found for this series:', comicsErr.response?.status);
        }
        setComics(comicsData);
    
        // אם המשתמש מחובר, מושך את ה-following
        if (user) {
          const followingResponse = await axios.get(`${API_BASE_URL}/api/users/${user._id}/following`);
          setIsFollowing(followingResponse.data.followingSeries.includes(id));
        }
    
        setError('');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(`Failed to fetch data: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, user]);    

  const handleFollowSeries = async () => {
    if (!user) {
      setError('You must be logged in to follow a series.');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/users/${user._id}/follow`, { seriesId: id });
      setIsFollowing(true);
    } catch (err) {
      console.error('Error following series:', err);
      setError(`Failed to follow series: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) return <div className="loading">טוען...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2>{series.name}</h2>
      <p>{series.description}</p>
      <img
        src={series.coverImage ? `${API_BASE_URL}/uploads/${series.coverImage}` : '/placeholder.jpg'}
        alt={series.name}
        className="img-fluid"
      />
      <button className="btn btn-primary mt-2" onClick={handleFollowSeries} disabled={isFollowing}>
        {isFollowing ? 'עוקב' : 'עקוב אחרי הסדרה'}
      </button>

      <h3 className="mt-4">קומיקסים בסדרה זו:</h3>
      <div className="comics-grid">
        {comics.length > 0 ? (
          comics.map((comic) => (
            <div key={comic._id} className="comic-card">
            <img
              src={`${API_BASE_URL}/${comic.pages[0]?.url.replace(/\\/g, '/')}`}
              alt={comic.title}
              className="comic-image"
            />
              <div className="comic-info">
                <h5>{comic.title}</h5>
                <p>{comic.description}</p>
                <Link to={`/comics/${comic._id}`} className="btn btn-primary">קרא קומיקס</Link>
              </div>
            </div>
          ))
        ) : (
          <p>מצטערים, אין כרגע קומיקסים בסדרה זו...</p>
        )}
      </div>
    </div>
  );
};

export default SeriesDetail;
