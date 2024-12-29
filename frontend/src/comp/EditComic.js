import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from '../context/UserContext';
import axios from "axios";

const EditComic = () => {
    const { comicId } = useParams();
    const { user } = useUser();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comic, setComic] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });

    useEffect(() => {
        const fetchComicData = async () => {
            if (!comicId) {
                setError('Missing comic ID');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`http://localhost:5000/api/comics/${comicId}`);
                
                if (!response.data) {
                    throw new Error('No comic data received');
                }

                if (response.data.author !== user._id) {
                    throw new Error('You are not authorized to edit this comic');
                }

                setComic(response.data);
                setFormData({
                    title: response.data.title || '',
                    description: response.data.description || ''
                });
                setError(null);
            } catch (err) {
                setError(err.message || 'Failed to load comic data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchComicData();
    }, [comicId, user._id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(
                `http://localhost:5000/api/comics/${comicId}`,
                { ...formData, userId: user._id }
            );

            setComic(response.data);
            navigate(`/comics/${comicId}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update comic');
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/comics/${comicId}`, {
                data: { userId: user._id }
            });
            navigate('/comics');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete comic');
        }
    };

    if (loading) return <div className="text-center p-5">Loading...</div>;
    if (error) return <div className="alert alert-danger m-4">{error}</div>;
    if (!comic) return <div className="text-center p-5">Comic not found</div>;

    return (
        <div className="container py-5">
            <h2>Edit Comic</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                        type="text"
                        className="form-control"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                        className="form-control"
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-danger ms-2" onClick={handleDelete}>Delete Comic</button>
            </form>
        </div>
    );
};

export default EditComic;