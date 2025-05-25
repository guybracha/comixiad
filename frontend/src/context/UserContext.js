import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

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
  localStorage.removeItem('token');
  localStorage.removeItem('user'); // ✅ זה היה חסר
  setUser(null);
};

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      // נסה לשלוף את המשתמש מהשרת על בסיס הטוקן
      axios
        .get('http://localhost:5000/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        })
        .catch((err) => {
          console.error('❌ Error fetching current user:', err);
          logout(); // אם הטוקן לא תקף – נקה את הכל
        });
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
