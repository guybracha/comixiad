import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Modal } from 'react-bootstrap';
import '../ComicReader.css';

const ComicReader = () => {
    const { id: comicId } = useParams(); // שינוי כאן
    const [comic, setComic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedPage, setSelectedPage] = useState(null);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    useEffect(() => {
        const fetchComic = async () => {
            try {
                console.log("Comic ID from useParams:", comicId);
                if (!comicId) {
                    setError('Comic ID is required');
                    setLoading(false);
                    return;
                }

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

    const getImageUrl = (page) => `http://localhost:5000/uploads/${page.url}`;

    const handlePageClick = (page, index) => {
        setSelectedPage(page);
        setCurrentPageIndex(index);
        setShowModal(true);
    };

    const handlePreviousPage = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(currentPageIndex - 1);
            setSelectedPage(comic.pages[currentPageIndex - 1]);
        }
    };

    const handleNextPage = () => {
        if (currentPageIndex < comic.pages.length - 1) {
            setCurrentPageIndex(currentPageIndex + 1);
            setSelectedPage(comic.pages[currentPageIndex + 1]);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container mt-4">
            <h2>{comic.title}</h2>
            <p>{comic.description}</p>
            <div className="comic-pages">
                {comic.pages.map((page, index) => (
                    <div key={index} className="comic-page" onClick={() => handlePageClick(page, index)}>
                        <img
                            src={getImageUrl(page)}
                            alt={`Page ${index + 1}`}
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
                        <div className="modal-content">
                            <button className="arrow left-arrow" onClick={handlePreviousPage} disabled={currentPageIndex === 0}>
                                &lt;
                            </button>
                            <img
                                src={getImageUrl(selectedPage)}
                                alt="Full size page"
                                className="full-size-page"
                            />
                            <button className="arrow right-arrow" onClick={handleNextPage} disabled={currentPageIndex === comic.pages.length - 1}>
                                &gt;
                            </button>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ComicReader;
