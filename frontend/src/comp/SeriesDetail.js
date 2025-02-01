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
      try {
        const [seriesResponse, comicsResponse, followingResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/Series/${id}`),
          axios.get(`${API_BASE_URL}/api/comics/series/${id}`),
          user ? axios.get(`${API_BASE_URL}/api/users/${user._id}/following`) : Promise.resolve({ data: { followingSeries: [] } })
        ]);

        setSeries(seriesResponse.data);
        setComics(comicsResponse.data);
        setIsFollowing(followingResponse.data.followingSeries.includes(id));
        setError('');
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handleFollowSeries = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/users/${user._id}/follow`, { seriesId: id });
      setIsFollowing(true);
    } catch (err) {
      console.error('Error following series:', err);
      setError(`Failed to follow series: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2>{series.name}</h2>
      <p>{series.description}</p>
      <button className="btn btn-primary" onClick={handleFollowSeries} disabled={isFollowing}>
        {isFollowing ? 'Following' : 'Follow Series'}
      </button>
      <div className="comics-grid">
        {comics.map((comic) => (
          <div key={comic._id} className="comic-card">
            <img
              src={`${API_BASE_URL}/uploads/${comic.pages[0]?.url}`}
              alt={comic.title}
              className="comic-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder.jpg';
              }}
            />
            <div className="comic-info">
              <h5>{comic.title}</h5>
              <p>{comic.description}</p>
              <Link to={`/comics/${comic._id}`} className="btn btn-primary">Read Comic</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeriesDetail;