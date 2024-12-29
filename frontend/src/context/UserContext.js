import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const useUser = () => {
    return useContext(UserContext);
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/users/${userId}`);
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser._id) {
                fetchUserData(parsedUser._id);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
        // Clear any other user-related data here (e.g., tokens)
    };

    return (
        <UserContext.Provider value={{ user, setUser, handleLogout, loading }}>
            {children}
        </UserContext.Provider>
    );
};