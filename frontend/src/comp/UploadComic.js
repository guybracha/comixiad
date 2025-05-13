import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import languages from '../config/Languages';
import genres from '../config/Genres';

const UploadComic = () => {
    const { user, token } = useUser();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [language, setLanguage] = useState('');
    const [genre, setGenre] = useState('');
    const [pages, setPages] = useState([]);
    const [series, setSeries] = useState('');
    const [allSeries, setAllSeries] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
    const fetchSeries = async () => {
        try {
            const response = await axios.get(
                'http://localhost:5000/api/series',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setAllSeries(response.data);
        } catch (err) {
            console.error('Failed to fetch series:', err);
        }
    };



        fetchSeries();
    }, []);

    const handlePagesChange = (e) => {
        setPages(Array.from(e.target.files));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setError('');
    
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("language", language);
            formData.append("genre", genre);
            formData.append("author", user._id); // מועבר לפי המודל
            if (series) {
                formData.append("series", series);
            }
            pages.forEach(file => {
                formData.append("pages", file);
            });
    
            const response = await axios.post(
                'http://localhost:5000/api/comics/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${user.token}` // שליחת טוקן!
                    }
                }
            );
    
            setMessage('Comic uploaded successfully!');
            setTitle('');
            setDescription('');
            setLanguage('');
            setGenre('');
            setSeries('');
            setPages([]);
        } catch (error) {
            console.error("Upload error:", error);
            setError('Upload failed. Please try again.');
        }
    };
    
    

    return (
        <div className="container py-5">
            <h2>Upload Comic</h2>
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title</label>
                    <input
                        type="text"
                        className="form-control"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea
                        className="form-control"
                        id="description"
                        rows="3"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="language" className="form-label">Language</label>
                    <select
                        className="form-select"
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        required
                    >
                        <option value="">Select Language</option>
                        {languages.map((lang) => (
                            <option key={lang} value={lang}>
                                {lang}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="genre" className="form-label">Genre</label>
                    <select
                        className="form-select"
                        id="genre"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        required
                    >
                        <option value="">Select Genre</option>
                        {genres.map((gen) => (
                            <option key={gen} value={gen}>
                                {gen}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="pages" className="form-label">Pages</label>
                    <input
                        type="file"
                        className="form-control"
                        id="pages"
                        multiple
                        onChange={handlePagesChange}
                        accept="image/*"
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="series" className="form-label">Series (optional)</label>
                    <select
                        className="form-select"
                        id="series"
                        value={series}
                        onChange={(e) => setSeries(e.target.value)}
                    >
                        <option value="">Select Series</option>
                        {allSeries.map((seriesItem) => (
                            <option key={seriesItem._id} value={seriesItem._id}>
                                {seriesItem.name}
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="btn btn-primary">Upload Comic</button>
            </form>
        </div>
    );
};

export default UploadComic;