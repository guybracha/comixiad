import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Modal } from 'react-bootstrap';

const ComicReader = () => {
    const { id } = useParams();
    const [comic, setComic] = useState(null);
    const [modalShow, setModalShow] = useState(false);
    const [currentPage, setCurrentPage] = useState(null);

    useEffect(() => {
        axios.get(`/api/comics/${id}`)
            .then(res => setComic(res.data))
            .catch(err => console.error(err));
    }, [id]);

    const handleImageClick = (page) => {
        setCurrentPage(page);
        setModalShow(true);
    };

    if (!comic) return <p>Loading...</p>;

    return (
        <div className="container mt-4">
            <h2>{comic.title}</h2>
            <div className="comic-pages">
                {comic.pages.map((page, index) => (
                    <img 
                        src={page.url} 
                        alt={`Page ${index + 1}`} 
                        key={index} 
                        className="img-fluid" 
                        onClick={() => handleImageClick(page.url)} // פתיחת המודל בעת לחיצה
                        style={{ cursor: 'pointer', maxWidth: '200px', margin: '10px' }}
                    />
                ))}
            </div>

            {/* Modal */}
            <Modal
                show={modalShow}
                onHide={() => setModalShow(false)}
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Comic Page</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {currentPage && <img src={currentPage} alt="Comic Page" className="img-fluid" />}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ComicReader;
