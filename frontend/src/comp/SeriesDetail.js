import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from './Config';
import '../SeriesDetail.css';

const SeriesDetail = () => {
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [seriesResponse, comicsResponse, followingResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/series/${id}`),
          axios.get(`${API_BASE_URL}/api/comics/series/${id}`),
          axios.get(`${API_BASE_URL}/api/user/following/${id}`)
        ]);

        setSeries(seriesResponse.data);
        setComics(comicsResponse.data);
        setIsFollowing(followingResponse.data.isFollowing);
        setError('');
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleFollowSeries = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/user/follow`, { seriesId: id });
      if (response.data.success) {
        setIsFollowing(true);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to follow the series. Please try again later.');
    }
  };

  const handleUnfollowSeries = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/user/unfollow`, { seriesId: id });
      if (response.data.success) {
        setIsFollowing(false);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to unfollow the series. Please try again later.');
    }
  };

  if (loading) return <div className="text-center mt-4">Loading series and comics...</div>;

  if (error) return (
    <div className="alert alert-danger mt-4">
      {error}
    </div>
  );

  if (!series) return <div className="text-center mt-4">Series not found.</div>;

  return (
    <div className="container mt-4">
      <div className="series-detail">
        <img
          src={`${API_BASE_URL}/uploads/${series.coverImage}`}
          alt={series.name}
          className="series-cover-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder.jpg';
          }}
        />
        <h2>{series.name}</h2>
        <p>{series.description}</p>
        <button
          className={`btn ${isFollowing ? 'btn-danger' : 'btn-primary'}`}
          onClick={isFollowing ? handleUnfollowSeries : handleFollowSeries}
        >
          {isFollowing ? 'Unfollow Series' : 'Follow Series'}
        </button>
      </div>

      <div className="comics-grid mt-4">
        {comics.length > 0 ? (
          comics.map((comic) => (
            <Link key={comic._id} to={`/comics/${comic._id}`} className="comic-card">
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
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center mt-4">No comics available for this series.</div>
        )}
      </div>
    </div>
  );
};

export default SeriesDetail;
