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

    useEffect(() => {
        if (!userId || userId === 'undefined') {
            if (user?._id) {
                navigate(`/profile/${user._id}`);
            } else {
                navigate('/login');
            }
            return;
        }

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/api/users/${userId}`);
                setProfile(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId, user, navigate]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!profile) return <div>Profile not found</div>;

    return (
        <div className="container mt-4">
            <h2>{profile.username}'s Profile</h2>
            <div className="card">
                <div className="card-body">
                    <p className="card-text">Email: {profile.email}</p>
                    <p className="card-text">User ID: {profile._id}</p>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;