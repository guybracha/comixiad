import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './context/UserContext';
import Navbar from './comp/Navbar';
import Homepage from './comp/Homepage';
import UploadComic from './comp/UploadComic';
import ComicReader from './comp/ComicReader';
import RegistrationForm from './comp/RegistrationForm';
import Login from './comp/Login';
import CategoryPage from './comp/CategoryPage';
import Error from './comp/Error';
import Footer from './comp/Footer';

const App = () => {
    const { user, setUser } = useUser();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, [setUser]);

    return (
        <Router>
            <Navbar user={user} />
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route 
                    path="/upload" 
                    element={user ? <UploadComic /> : <Navigate to="/login" replace />} 
                />
                <Route path="/comics/:id" element={<ComicReader />} />
                <Route path="/register" element={<RegistrationForm />} />
                <Route path="/login" element={<Login />} />
                <Route path="/category/:category" element={<CategoryPage />} />
                <Route path="*" element={<Error />} />
            </Routes>
            <Footer />
        </Router>
    );
};

export default App;
