import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import axios from 'axios';
import '../ComicReader.css';

const ComicReader = () => {
    const { id } = useParams();
    const [comic, setComic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedPage, setSelectedPage] = useState(null);

    const getImageUrl = (page) => {
        if (!page) return '/placeholder.jpg';
        
        // If page is an object with url property
        if (typeof page === 'object' && page.url) {
            return `http://localhost:5000/uploads/${page.url}`;
        }
        
        // If page is a string (filename)
        return `http://localhost:5000/uploads/${page}`;
    };

    useEffect(() => {
        const fetchComic = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/comics/${id}`);
                console.log('Comic data:', response.data); // Debug log
                setComic(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching comic:', err);
                setError('Failed to load comic');
                setLoading(false);
            }
        };

        fetchComic();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!comic) return <div>Comic not found</div>;

    return (
        <div className="comic-reader">
            <div className="pages-container">
                {comic.pages && comic.pages.map((page, index) => (
                    <div key={index} className="page-wrapper">
                        <img
                            src={getImageUrl(page)}
                            alt={`Page ${index + 1}`}
                            className="comic-page"
                            onClick={() => {
                                setSelectedPage(page);
                                setShowModal(true);
                            }}
                            onError={(e) => {
                                console.error('Failed to load image:', page);
                                e.target.src = '/placeholder.jpg';
                            }}
                        />
                    </div>
                ))}
            </div>

            <Modal 
                show={showModal} 
                onHide={() => setShowModal(false)}
                size="xl"
                centered
            >
                <Modal.Body className="p-0">
                    {selectedPage && (
                        <img
                            src={getImageUrl(selectedPage)}
                            alt="Full size page"
                            className="img-fluid w-100"
                            onError={(e) => e.target.src = '/placeholder.jpg'}
                        />
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ComicReader;