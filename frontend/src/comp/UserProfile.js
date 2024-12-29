import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from '../context/UserContext';
import { Modal } from 'react-bootstrap';
import axios from "axios";
import defaultAvatar from '../images/placeholder.jpg';

const UserProfile = () => {
    const { userId } = useParams();
    const { user, setUser } = useUser();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState(null);
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [userComics, setUserComics] = useState([]);
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: '',
        location: '',
        favoriteGenres: [],
        socialLinks: {
            twitter: '',
            instagram: '',
            deviantart: ''
        }
    });

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) {
                setError('Missing user ID');
                setLoading(false);
                return;
            }

            try {
                const [userResponse, comicsResponse] = await Promise.all([
                    axios.get(`http://localhost:5000/api/user/${userId}`),
                    axios.get(`http://localhost:5000/api/comics/user/${userId}`)
                ]);

                if (!userResponse.data) {
                    throw new Error('No user data received');
                }

                setProfile(userResponse.data);
                setUserComics(comicsResponse.data);
                setFormData({
                    username: userResponse.data.username || '',
                    email: userResponse.data.email || '',
                    bio: userResponse.data.bio || '',
                    location: userResponse.data.location || '',
                    favoriteGenres: userResponse.data.favoriteGenres || [],
                    socialLinks: userResponse.data.socialLinks || {
                        twitter: '',
                        instagram: '',
                        deviantart: ''
                    }
                });
                setError(null);
            } catch (err) {
                setError('Failed to load user data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('username', formData.username);
            formDataToSend.append('bio', formData.bio);
            formDataToSend.append('location', formData.location);
            formDataToSend.append('socialLinks', JSON.stringify(formData.socialLinks));
            
            if (avatar) {
                formDataToSend.append('avatar', avatar);
            }

            const response = await axios.put(
                `http://localhost:5000/api/users/${userId}`,
                formDataToSend,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            setProfile(response.data);
            if (user?._id === userId) {
                setUser(response.data);
            }
            setIsEditing(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        }
    };

    const handleEditComic = (comicId) => {
        navigate(`/comics/edit/${comicId}`);
    };

    const handleDeleteComic = async (comicId) => {
        try {
            await axios.delete(`http://localhost:5000/api/comics/${comicId}`, {
                data: { userId: user._id }
            });
            setUserComics(userComics.filter(comic => comic._id !== comicId));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete comic');
        }
    };

    if (loading) return <div className="text-center p-5">Loading...</div>;
    if (error) return <div className="alert alert-danger m-4">{error}</div>;
    if (!profile) return <div className="text-center p-5">Profile not found</div>;

    return (
        <div className="container py-5">
            <div className="row">
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body text-center">
                            <img 
                                src={profile.avatar || defaultAvatar} 
                                alt="Profile" 
                                className="rounded-circle mb-3"
                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                            />
                            <h3>{profile.username}</h3>
                            <p className="text-muted">{profile.location}</p>
                            <p>{profile.bio}</p>
                            
                            {user?._id === userId && (
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-md-8">
                    <h4>Published Comics</h4>
                    <div className="row g-4">
                        {userComics.map(comic => (
                            <div key={comic._id} className="col-md-6">
                                <div className="card h-100">
                                    <img 
                                        src={comic.pages[0]?.url || defaultAvatar}
                                        alt={comic.title}
                                        className="card-img-top"
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                    <div className="card-body">
                                        <h5>{comic.title}</h5>
                                        <p>{comic.description}</p>
                                        <button 
                                            className="btn btn-primary"
                                            onClick={() => handleEditComic(comic._id)}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className="btn btn-danger ms-2"
                                            onClick={() => handleDeleteComic(comic._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Modal show={isEditing} onHide={() => setIsEditing(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Profile Image</label>
                            <div className="d-flex align-items-center">
                                <img
                                    src={avatarPreview || profile.avatar || defaultAvatar}
                                    alt="Avatar preview"
                                    className="rounded-circle me-3"
                                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                />
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Username</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Bio</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                value={formData.bio}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Location</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary">
                            Save Changes
                        </button>
                    </form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default UserProfile;