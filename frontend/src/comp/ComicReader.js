import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../ComicReader.css';

const ComicReader = () => {
    const { id: comicId } = useParams();
    const [comic, setComic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imgErrors, setImgErrors] = useState({}); // ניהול שגיאות תמונה

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
            <h2>{comic?.title || 'Untitled'}</h2>
            <p>{comic?.description || 'No description available'}</p>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Views: {comic?.views || 0}</span>
            </div>
            <div className="comic-pages">
                {comic?.pages?.length > 0 ? (
                    comic.pages.map((page, index) => {
                        const imageUrl = `http://localhost:5000/uploads/comics/${page.url}`;
                        return (
                            <div key={index} className="comic-page mb-4">
                                {!imgErrors[index] ? (
                                    <img
                                        src={page.url}
                                        alt={`Page ${index + 1}`}
                                        onError={() =>
                                            setImgErrors((prev) => ({ ...prev, [index]: true }))
                                        }
                                        className="img-fluid"
                                    />
                                ) : (
                                    <div className="text-danger">
                                        ⚠️ Failed to load page {index + 1}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <p>No pages available</p>
                )}
            </div>
        </div>
    );
};

export default ComicReader;
