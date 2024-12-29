import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from '../context/UserContext';
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
        email: ''
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                if (!userId) {
                    setError('User ID is required');
                    setLoading(false);
                    return;
                }

                const response = await axios.get(`http://localhost:5000/api/users/${userId}`);
                console.log('User profile data:', response.data); // Debug log
                setProfile(response.data);
                setFormData({
                    username: response.data.username,
                    email: response.data.email
                });
                setLoading(false);
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError('Failed to load user profile');
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [userId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!profile) return <div>User not found</div>;

    return (
        <div className="container mt-4">
            <h2>{profile.username}'s Profile</h2>
            <p>Email: {profile.email}</p>
            <p>Joined: {new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>
    );
};

export default UserProfile;