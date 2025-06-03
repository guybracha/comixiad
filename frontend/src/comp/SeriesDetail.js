import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../SeriesDetail.css';
import { useUser } from '../context/UserContext';
import { Helmet } from 'react-helmet';
import { API_BASE_URL } from '../Config';
import RandomThree from './RandomThree';

const SeriesDetail = () => {
  const { id } = useParams();
  const { user } = useUser();

  const [series, setSeries] = useState(null);
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);

  // ✅ טוען את פרטי הסדרה והקומיקסים
  useEffect(() => {
    const fetchSeriesAndComics = async () => {
      setLoading(true);
      try {
        const seriesResponse = await axios.get(`${API_BASE_URL}/api/series/${id}`);
        setSeries(seriesResponse.data);

        const comicsResponse = await axios.get(`${API_BASE_URL}/api/series/${id}/comics`);
        setComics(comicsResponse.data || []);
        setError('');
      } catch (err) {
        console.error('Error fetching series/comics:', err);
        setError(`Failed to fetch series or comics: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSeriesAndComics();
  }, [id]);

  // ✅ טוען את רשימת הסדרות שהמשתמש עוקב אחריהן
  useEffect(() => {
    const fetchFollowingStatus = async () => {
      if (!user || !user._id) return;

      try {
        const response = await axios.get(`${API_BASE_URL}/api/users/${user._id}/following`);
        setIsFollowing(response.data.followingSeries.includes(id));
      } catch (err) {
        console.error('Error fetching following status:', err);
      }
    };

    fetchFollowingStatus();
  }, [user, id]);

      const handleFollowSeries = async () => {
      if (!user || !user._id) {
        setError('You must be logged in to follow a series.');
        return;
      };

      try {
        await axios.post(`${API_BASE_URL}/api/series/${id}/follow`, { userId: user._id });
        setIsFollowing(true);
        setError('');
      } catch (err) {
        console.error('Error following series:', err);
        setError(`Failed to follow series: ${err.response?.data?.message || err.message}`);
      }
    };

    const handleUnfollowSeries = async () => {
      if (!user || !user._id) {
        setError('You must be logged in to unfollow a series.');
        return;
      }

      try {
        await axios.post(`${API_BASE_URL}/api/series/${id}/unfollow`, { userId: user._id });
        setIsFollowing(false);
        setError('');
      } catch (err) {
        console.error('Error unfollowing series:', err);
        setError(`Failed to unfollow series: ${err.response?.data?.message || err.message}`);
      }
    };

  if (loading) return <div className="loading">טוען...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <Helmet>
      <meta property="og:title" content={series?.name || 'Comixiad'} />
      <meta property="og:description" content={series?.description || 'Your platform for reading comics'} />
      <meta
        property="og:image"
        content={
          series?.coverImage
            ? `${API_BASE_URL}/uploads/${series.coverImage.replace(/\\/g, '/')}`
            : 'https://comixiad.com/default-cover.jpg'
        }
      />
      <meta property="og:url" content={`https://comixiad.com/series/${series?._id}`} />
      <meta property="og:type" content="website" />
    </Helmet>


      <h2>{series.name}</h2>
      <p>{series.description}</p>

      {series.followers && (
        <div className="mt-2 text-muted">
          📢 {series.followers.length} עוקבים לסדרה זו
        </div>
      )}
      
      {isFollowing ? (
        <button className="btn btn-outline-secondary mt-2" onClick={handleUnfollowSeries}>
          בטל מעקב
        </button>
      ) : (
        <button className="btn btn-primary mt-2" onClick={handleFollowSeries}>
          עקוב אחרי הסדרה
        </button>
      )}
      <img
        src={series.coverImage ? `${API_BASE_URL}/uploads/${series.coverImage}` : '../images/placeholder.jpg'}
        alt={series.name}
        className="img-fluid"
      />

      <h3 className="mt-4">קומיקסים בסדרה זו:</h3>
      <div className="comics-grid">
        {comics.length > 0 ? (
          comics.map((comic) => (
            <div key={comic._id} className="comic-card">
              <img
                src={
                  comic.pages[0]?.url
                    ? `${API_BASE_URL}/${comic.pages[0].url.replace(/\\/g, '/')}`
                    : '/images/placeholder.jpg'
                }
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
      <RandomThree />
    </div>
  );
};

export default SeriesDetail;
