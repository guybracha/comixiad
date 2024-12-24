import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './comp/Navbar';
import ComicReader from './comp/ComicReader';
import UploadComic from './comp/UploadComic';
import Error from './comp/Error';
import './App.css';
import Footer from './comp/Footer';
import Homepage from './comp/Homepage';
import CategoryPage from './comp/CategoryPage';
import RegistrationForm from './comp/RegistrationForm';
import Login from './comp/Login';

const App = () => {
    const [user, setUser] = useState(null);

    // Handle login
    const handleLogin = (loggedInUser) => {
        setUser(loggedInUser);
        console.log('User logged in:', loggedInUser);
    };

    return (
        <Router>
            <Navbar user={user} />
            <Routes>
                <Route path="/" element={<Homepage />} />
                <Route path="/upload" element={<UploadComic />} />
                <Route path="/comics/:id" element={<ComicReader />} />
                <Route path="/register" element={<RegistrationForm />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/category/:category" element={<CategoryPage />} />
                <Route path="*" element={<Error />} />
            </Routes>
            <Footer />
        </Router>
    );
};

export default App;
