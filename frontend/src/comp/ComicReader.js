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
    const [hasLiked, setHasLiked] = useState(false);

    useEffect(() => {
        const fetchComic = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/comics/${comicId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setComic(response.data);

                // בדיקה אם המשתמש כבר נתן לייק
                if (response.data.likedBy.includes(response.data.currentUser)) {
                    setHasLiked(true);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching comic:', err);
                setError('Failed to load comic');
                setLoading(false);
            }
        };

        fetchComic();
    }, [comicId]);

    const handleLike = async () => {
        try {
            await axios.put(
                `http://localhost:5000/api/comics/${comicId}/like`,
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setHasLiked(true);
            setComic((prevComic) => ({ ...prevComic, likes: prevComic.likes + 1 }));
        } catch (err) {
            console.error('Failed to update likes:', err);
            alert(err.response?.data?.message || 'Error liking comic');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container mt-4">
            <h2>{comic.title}</h2>
            <p>{comic.description}</p>
            <div className="d-flex justify-content-between align-items-center">
                <span>Views: {comic.views}</span>
                <button className="btn btn-primary" onClick={handleLike} disabled={hasLiked}>
                    {hasLiked ? 'Liked' : `Like (${comic.likes})`}
                </button>
            </div>
            <div className="comic-pages">
                {comic.pages.map((page, index) => (
                    <div key={index} className="comic-page">
                        <img
                            src={`http://localhost:5000/uploads/${page.url}`}
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
