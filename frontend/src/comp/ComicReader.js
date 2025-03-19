import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Modal } from 'react-bootstrap';
import '../ComicReader.css';

const ComicReader = () => {
    const { id: comicId } = useParams();
    const [comic, setComic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchComic = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/comics/${comicId}`);
                setComic(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching comic:', err);
                setError('Failed to load comic');
                setLoading(false);
            }
        };

        fetchComic();
    }, [comicId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container mt-4">
            <h2>{comic.title}</h2>
            <p>{comic.description}</p>
            <div className="d-flex justify-content-between align-items-center">
                <span>Views: {comic.views}</span>
            </div>
            <div className="comic-pages">
                {comic.pages.map((page, index) => (
                    <div key={index} className="comic-page">
                        <img
                            src={`http://localhost:5000/${page.url}`}
                            alt={`Page ${index + 1}`}
                            onError={(e) => {
                                e.target.src = '/placeholder.jpg';
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ComicReader;