import React, { useState } from 'react';
import axios from 'axios'; // To handle HTTP requests

const UploadComics = () => {
    const [files, setFiles] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [genre, setGenre] = useState('');
    const [language, setLanguage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [filePreviews, setFilePreviews] = useState([]);

    const handleFileChange = (e) => {
        const selectedFiles = e.target.files;
        setFiles(selectedFiles);

        // Create file previews for user to see
        const previews = Array.from(selectedFiles).map((file) => {
            return URL.createObjectURL(file);
        });
        setFilePreviews(previews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!files || files.length === 0) {
            alert('Please select comic files to upload');
            return;
        }

        setIsUploading(true);

        // Prepare form data to send to backend
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('genre', genre);
        formData.append('language', language);

        // Append files to form data
        Array.from(files).forEach((file) => {
            formData.append('files', file);
        });

        try {
            const response = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = (progressEvent.loaded / progressEvent.total) * 100;
                    setUploadProgress(Math.round(progress));
                },
            });

            alert('Comic uploaded successfully');
            console.log(response.data);
            setIsUploading(false);
            setFilePreviews([]); // Clear file previews after successful upload
            setTitle('');
            setDescription('');
            setGenre('');
            setLanguage('');
        } catch (err) {
            console.error('Error uploading comic:', err);
            setIsUploading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Upload Comic</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title</label>
                    <input
                        type="text"
                        className="form-control"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <input
                        type="text"
                        className="form-control"
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="genre" className="form-label">Genre</label>
                    <input
                        type="text"
                        className="form-control"
                        id="genre"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="language" className="form-label">Language</label>
                    <input
                        type="text"
                        className="form-control"
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="comicPages" className="form-label">Upload Comic Pages</label>
                    <input
                        type="file"
                        className="form-control"
                        id="comicPages"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>

                {/* Show image previews before submission */}
                {filePreviews.length > 0 && (
                    <div className="mb-3">
                        <h5>Preview</h5>
                        <div className="d-flex flex-wrap">
                            {filePreviews.map((preview, index) => (
                                <img
                                    key={index}
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    className="img-thumbnail"
                                    style={{ width: '100px', margin: '5px' }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Progress bar */}
                {isUploading && (
                    <div className="progress mb-3">
                        <div
                            className="progress-bar"
                            role="progressbar"
                            style={{ width: `${uploadProgress}%` }}
                            aria-valuenow={uploadProgress}
                            aria-valuemin="0"
                            aria-valuemax="100"
                        >
                            {uploadProgress}%
                        </div>
                    </div>
                )}

                <button type="submit" className="btn btn-primary" disabled={isUploading}>
                    {isUploading ? 'Uploading...' : 'Upload'}
                </button>
            </form>
        </div>
    );
};

export default UploadComics;
