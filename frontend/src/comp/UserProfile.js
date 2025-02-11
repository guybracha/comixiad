import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from '../context/UserContext';
import axios from "axios";
import { Modal, Button, Form } from 'react-bootstrap';
import defaultAvatar from '../images/placeholder.jpg';
import '../UserProfile.css';

const UserProfile = () => {
    const { userId } = useParams();
    const { user } = useUser();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState(null);
    const [userComics, setUserComics] = useState([]);
    const [userSeries, setUserSeries] = useState([]);
    const [showModal, setShowModal] = useState(false);
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: '',
        avatar: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        location: '',
        favoriteGenres: '',
        twitter: '',
        instagram: '',
        deviantart: '',
        createdAt: ''
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                if (!userId) {
                    setError('User ID is required');
                    setLoading(false);
                    return;
                }

                const userResponse = await axios.get(`http://localhost:5000/api/users/${userId}`);
                console.log('User profile data:', userResponse.data); // Debug log
                setProfile(userResponse.data);
                setFormData({
                    username: userResponse.data.username || '',
                    email: userResponse.data.email || '',
                    bio: userResponse.data.bio || '',
                    avatar: userResponse.data.avatar || '',
                    firstName: userResponse.data.firstName || '',
                    lastName: userResponse.data.lastName || '',
                    dateOfBirth: userResponse.data.dateOfBirth || '',
                    location: userResponse.data.location || '',
                    favoriteGenres: userResponse.data.favoriteGenres ? userResponse.data.favoriteGenres.join(', ') : '',
                    twitter: userResponse.data.socialLinks?.twitter || '',
                    instagram: userResponse.data.socialLinks?.instagram || '',
                    deviantart: userResponse.data.socialLinks?.deviantart || '',
                    createdAt: userResponse.data.createdAt || ''
                });

                const comicsResponse = await axios.get(`http://localhost:5000/api/comics?author=${userId}`);
                setUserComics(comicsResponse.data);

                const seriesResponse = await axios.get(`http://localhost:5000/api/series?author=${userId}`);
                setUserSeries(seriesResponse.data);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError('Failed to load user profile');
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [userId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, avatar: file });
    };

    const handleDeleteComic = async (comicId) => {
        if (!window.confirm("Are you sure you want to delete this comic?")) return;
    
        try {
            await axios.delete(`http://localhost:5000/api/comics/${comicId}`);
            setUserComics(userComics.filter(comic => comic._id !== comicId)); // הסרת הקומיקס מהרשימה ב-React
        } catch (err) {
            console.error("Error deleting comic:", err);
            setError("Failed to delete comic");
        }
    };
    
    const handleDeleteSeries = async (seriesId) => {
        if (!window.confirm("Are you sure you want to delete this series?")) return;
    
        try {
            await axios.delete(`http://localhost:5000/api/series/${seriesId}`);
            setUserSeries(userSeries.filter(series => series._id !== seriesId)); // הסרת הסדרה מהרשימה ב-React
        } catch (err) {
            console.error("Error deleting series:", err);
            setError("Failed to delete series");
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        for (const key in formData) {
            formDataToSend.append(key, formData[key]);
        }
        try {
            const response = await axios.put(`http://localhost:5000/api/users/${userId}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setProfile(response.data);
            setShowModal(false);
        } catch (err) {
            console.error('Error updating user profile:', err);
            setError(`Failed to update user profile: ${err.response?.data?.message || err.message}`);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!profile) return <div>User not found</div>;

    return (
        <div className="container mt-4">
            <h2>{profile.username}'s Profile</h2>
            <img
                src={profile.avatar ? `http://localhost:5000/${profile.avatar}` : defaultAvatar}
                alt={profile.username}
                className="profile-avatar"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultAvatar;
                }}
            />
            <p>Email: {profile.email}</p>
            <p>Bio: {profile.bio}</p>
            <p>Location: {profile.location}</p>
            <p>Favorite Genres: {profile.favoriteGenres?.join(', ')}</p>
            {profile.socialLinks?.twitter && (
                <p>Twitter: <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer">{profile.socialLinks.twitter}</a></p>
            )}
            {profile.socialLinks?.instagram && (
                <p>Instagram: <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer">{profile.socialLinks.instagram}</a></p>
            )}
            {profile.socialLinks?.deviantart && (
                <p>Deviantart: <a href={profile.socialLinks.deviantart} target="_blank" rel="noopener noreferrer">{profile.socialLinks.deviantart}</a></p>
            )}
            <p>Joined: {new Date(profile.createdAt).toLocaleDateString()}</p>
            <Button variant="primary" onClick={() => setShowModal(true)}>Edit Profile</Button>

            <h3>Comics Created</h3>
            <div className="comics-grid">
                {userComics.map((comic) => (
                    <div key={comic._id} className="comic-card">
                        <img
                            src={`http://localhost:5000/uploads/${comic.pages[0]?.url}`}
                            alt={comic.title}
                            className="comic-image"
                            onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.jpg'; }}
                        />
                        <div className="comic-info">
                            <h5>{comic.title}</h5>
                            <p>{comic.description}</p>
                            {user && user._id === profile._id && ( // הצגת כפתור רק אם המשתמש הוא הבעלים
                                <button className="btn btn-danger" onClick={() => handleDeleteComic(comic._id)}>
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <h3>Series Created</h3>
            <div className="comics-grid">
                {userSeries.map((series) => (
                    <div key={series._id} className="series-card">
                        <img
                            src={`http://localhost:5000/uploads/${series.coverImage}`}
                            alt={series.name}
                            className="series-image"
                            onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.jpg'; }}
                        />
                        <div className="series-info">
                            <h5>{series.name}</h5>
                            <p>{series.description}</p>
                            {user && user._id === profile._id && ( // הצגת כפתור רק אם המשתמש הוא הבעלים
                                <button className="btn btn-danger" onClick={() => handleDeleteSeries(series._id)}>
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>


            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: '#f8f9fa' }}>
                    <Form onSubmit={handleFormSubmit}>
                        <Form.Group controlId="formUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formFirstName">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formLastName">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formDateOfBirth">
                            <Form.Label>Date of Birth</Form.Label>
                            <Form.Control
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formLocation">
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formFavoriteGenres">
                            <Form.Label>Favorite Genres</Form.Label>
                            <Form.Control
                                type="text"
                                name="favoriteGenres"
                                value={formData.favoriteGenres}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formTwitter">
                            <Form.Label>Twitter</Form.Label>
                            <Form.Control
                                type="text"
                                name="twitter"
                                value={formData.twitter}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formInstagram">
                            <Form.Label>Instagram</Form.Label>
                            <Form.Control
                                type="text"
                                name="instagram"
                                value={formData.instagram}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formDeviantart">
                            <Form.Label>Deviantart</Form.Label>
                            <Form.Control
                                type="text"
                                name="deviantart"
                                value={formData.deviantart}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formBio">
                            <Form.Label>Bio</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="formAvatar">
                            <Form.Label>Avatar</Form.Label>
                            <Form.Control
                                type="file"
                                name="avatar"
                                onChange={handleFileChange}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Save Changes
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default UserProfile;