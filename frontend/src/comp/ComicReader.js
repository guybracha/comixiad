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
        
        // Check for different page URL formats
        if (page.url) return `http://localhost:5000${page.url}`;
        if (page.filename) return `http://localhost:5000/uploads/${page.filename}`;
        
        // If page is just a string (direct filename)
        if (typeof page === 'string') return `http://localhost:5000/uploads/${page}`;
        
        console.error('Invalid page format:', page);
        return '/placeholder.jpg';
    };

    useEffect(() => {
        const fetchComic = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/comics/${id}`);
                console.log('Comic data:', response.data);
                if (response.data.pages) {
                    console.log('Pages:', response.data.pages);
                }
                setComic(response.data);
            } catch (err) {
                console.error('Error fetching comic:', err);
                setError(err.response?.data?.error || 'Failed to load comic');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchComic();
    }, [id]);

    return (
        <div className="comic-container container-fluid py-4">
            <h1 className="text-center mb-4">{comic?.title}</h1>
            
            <div className="row g-4 justify-content-center">
                {Array.isArray(comic?.pages) && comic.pages.map((page, index) => (
                    <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3">
                        <div 
                            className="page-thumbnail"
                            onClick={() => {
                                console.log('Clicked page:', page);
                                setSelectedPage(page);
                                setShowModal(true);
                            }}
                            role="button"
                        >
                            <img 
                                src={getImageUrl(page)}
                                alt={`Page ${index + 1}`}
                                className="img-fluid rounded shadow"
                                onError={(e) => {
                                    console.error('Failed to load image:', page);
                                    e.target.src = '/placeholder.jpg';
                                }}
                            />
                            <div className="page-number">{index + 1}</div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
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