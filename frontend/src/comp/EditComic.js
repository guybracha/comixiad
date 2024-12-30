import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from '../context/UserContext';
import axios from "axios";
import { Modal, Button } from 'react-bootstrap';

const EditComic = () => {
    const { comicId } = useParams();
    const { user } = useUser();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comic, setComic] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        language: '',
        genre: '',
        pages: []
    });
    const [showModal, setShowModal] = useState(false);
    const [pagesToDelete, setPagesToDelete] = useState([]);

    useEffect(() => {
        const fetchComicData = async () => {
            if (!comicId) {
                setError('Missing comic ID');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`http://localhost:5000/api/comics/${comicId}`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                if (response.data.author !== user._id) {
                    setError('You are not authorized to edit this comic');
                    setLoading(false);
                    return;
                }
                setComic(response.data);
                setFormData({
                    title: response.data.title,
                    description: response.data.description,
                    language: response.data.language,
                    genre: response.data.genre,
                    pages: response.data.pages
                });
                setLoading(false);
            } catch (err) {
                console.error('Error fetching comic data:', err);
                setError('Failed to load comic data');
                setLoading(false);
            }
        };

        fetchComicData();
    }, [comicId, user._id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData({ ...formData, pages: files });
    };

    const handleDeletePage = (page) => {
        setPagesToDelete([...pagesToDelete, page]);
        setFormData({ ...formData, pages: formData.pages.filter(p => p !== page) });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setShowModal(true);
    };

    const handleConfirmUpdate = async () => {
        setShowModal(false);
        const formDataToSend = new FormData();
        for (const key in formData) {
            if (key === 'pages') {
                formData[key].forEach((file, index) => {
                    formDataToSend.append(`pages[${index}]`, file);
                });
            } else {
                formDataToSend.append(key, formData[key]);
            }
        }
        formDataToSend.append('pagesToDelete', JSON.stringify(pagesToDelete));

        try {
            await axios.put(`http://localhost:5000/api/comics/${comicId}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${user.token}`
                }
            });
            navigate(`/profile/${user._id}`);
        } catch (err) {
            console.error('Error updating comic:', err);
            setError(`Failed to update comic: ${err.response?.data?.message || err.message}`);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container mt-4">
            <h2>Edit Comic</h2>
            <form onSubmit={handleFormSubmit}>
                <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title</label>
                    <input
                        type="text"
                        className="form-control"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        rows="3"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="language" className="form-label">Language</label>
                    <input
                        type="text"
                        className="form-control"
                        id="language"
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="genre" className="form-label">Genre</label>
                    <input
                        type="text"
                        className="form-control"
                        id="genre"
                        name="genre"
                        value={formData.genre}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="pages" className="form-label">Pages</label>
                    <input
                        type="file"
                        className="form-control"
                        id="pages"
                        name="pages"
                        multiple
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                </div>
                <div className="mb-3">
                    <label>Existing Pages</label>
                    <div className="existing-pages">
                        {comic.pages.map((page, index) => (
                            <div key={index} className="existing-page">
                                <img src={`http://localhost:5000/${page.url}`} alt={`Page ${index + 1}`} className="img-thumbnail" />
                                <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDeletePage(page)}>Delete</button>
                            </div>
                        ))}
                    </div>
                </div>
                <button type="submit" className="btn btn-primary">Save Changes</button>
            </form>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Update</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to update this comic?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleConfirmUpdate}>Confirm</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default EditComic;