import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Modal } from 'react-bootstrap';
import '../ComicReader.css';

const ComicReader = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [comic, setComic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalShow, setModalShow] = useState(false);
    const [currentPage, setCurrentPage] = useState(null);

    useEffect(() => {
        const fetchComic = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/comics/${id}`);
                if (!response.data) {
                    throw new Error('Comic not found');
                }
                setComic(response.data);
            } catch (error) {
                console.error('Error fetching comic:', error);
                setError(error.response?.data?.error || 'Failed to load comic');
                if (error.response?.status === 404) {
                    navigate('/comics');
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchComic();
        }
    }, [id, navigate]);


    const getImageUrl = (page) => {
        if (!page?.filename && !page?.url) return '/images/placeholder.jpg';
        
        // Try filename first, then fallback to url
        const imagePath = page.filename || page.url;
        
        // Remove leading slash if exists
        const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
        
        // Construct full URL
        return `http://localhost:5000/uploads/${cleanPath}`;
    };

    const handleImageClick = (page) => {
        setCurrentPage(page);
        setModalShow(true);
    };

    if (loading) return <div className="loading-spinner">Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!comic) return <div>Comic not found</div>;

    return (
        <div className="comic-reader">
            <div className="comic-header">
                <h1 className="comic-title">{comic.title}</h1>
                <p className="comic-description">{comic.description}</p>
            </div>
            <div className="comic-pages">
                {comic.pages.map((page, index) => (
                    <div key={index} className="comic-page" onClick={() => handleImageClick(page)}>
                        <img
                            src={getImageUrl(page)}
                            alt={`Page ${index + 1}`}
                            onError={(e) => {
                                console.error(`Failed to load page ${index + 1}`);
                                e.target.src = '/images/placeholder.jpg';
                            }}
                        />
                    </div>
                ))}
            </div>
    
            <Modal
                show={modalShow}
                onHide={() => setModalShow(false)}
                size="xl"
                centered
                className="comic-modal"
            >
                {currentPage && (
                    <Modal.Body>
                        <img
                            src={getImageUrl(currentPage)}
                            alt="Full size page"
                            className="modal-image"
                        />
                    </Modal.Body>
                )}
            </Modal>
        </div>
    );
};

export default ComicReader;