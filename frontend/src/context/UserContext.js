// src/context/UserContext.js
import React, { createContext, useContext, useState } from 'react';

// יצירת הקונטקסט
const UserContext = createContext();

// קריאה לקונטקסט
export const useUser = () => useContext(UserContext);

// פרוביידר גלובלי
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const login = (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, login, logout, setUser }}>
            {children}
        </UserContext.Provider>
    );
};
