import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../SeriesDetail.css';

const SeriesDetail = () => {
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/series/${id}`);
        setSeries(response.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch series. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchComics = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/comics?series=${id}`);
        setComics(response.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch comics. Please try again later.');
      }
    };

    fetchSeries();
    fetchComics();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      {series && (
        <div className="series-detail">
          <img
            src={`http://localhost:5000/uploads/${series.coverImage}`}
            alt={series.name}
            className="series-cover-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder.jpg';
            }}
          />
          <h2>{series.name}</h2>
          <p>{series.description}</p>
        </div>
      )}
      <div className="comics-grid">
        {comics.map((comic) => (
          <div key={comic._id} className="comic-card">
            <img
              src={`http://localhost:5000/uploads/${comic.pages[0]?.url}`}
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeriesDetail;