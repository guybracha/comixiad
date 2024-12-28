import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from '../context/UserContext';
import axios from "axios";

const UserProfile = () => {
    const { userId } = useParams();
    const { user } = useUser();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        bio: '',
        location: '',
        favoriteGenres: []
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/user/${userId}`);
                setProfile(response.data);
                setFormData({
                    bio: response.data.bio || '',
                    location: response.data.location || '',
                    favoriteGenres: response.data.favoriteGenres || []
                });
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`http://localhost:5000/api/user/${userId}`, formData);
            setProfile(response.data);
            setIsEditing(false);
        } catch (err) {
            console.error('Update error:', err);
            setError(err.response?.data?.message || 'Error updating profile');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!profile) return <div>Profile not found</div>;

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-body">
                    <h2 className="card-title">{profile.username}'s Profile</h2>
                    {isEditing ? (
                        <form onSubmit={handleUpdate}>
                            <div className="mb-3">
                                <label className="form-label">Bio</label>
                                <textarea 
                                    className="form-control"
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
                            <div className="mb-3">
                                <label className="form-label">Favorite Genres</label>
                                <input 
                                    type="text"
                                    className="form-control"
                                    value={formData.favoriteGenres.join(', ')}
                                    onChange={(e) => setFormData({
                                        ...formData, 
                                        favoriteGenres: e.target.value.split(',').map(g => g.trim())
                                    })}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary">Save</button>
                            <button 
                                type="button" 
                                className="btn btn-secondary ms-2"
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel
                            </button>
                        </form>
                    ) : (
                        <>
                            <p className="card-text">Email: {profile.email}</p>
                            <p className="card-text">Bio: {profile.bio || 'No bio added'}</p>
                            <p className="card-text">Location: {profile.location || 'Not specified'}</p>
                            <p className="card-text">
                                Favorite Genres: {profile.favoriteGenres?.length ? 
                                    profile.favoriteGenres.join(', ') : 
                                    'None specified'}
                            </p>
                            {user?._id === userId && (
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit Profile
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;