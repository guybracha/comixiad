import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Navbar = () => {
    const { user, logout } = useUser();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        navigate(`/search?query=${searchQuery}`);
    };

        
    const handleLogoutClick = () => {
        logout(); // קריאה לפונקציה הנכונה מה-UserContext
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">Comixiad</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">בית</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/upload">העלה קומיקס</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/CreateSeries">צור סדרה</Link>
                        </li>
                        {user && (
                            <li className="nav-item">
                                <Link className="nav-link" to={`/profile/${user._id}`}>פרופיל</Link>
                            </li>
                        )}
                    </ul>
                    <form className="d-flex" onSubmit={handleSearchSubmit}>
                        <input
                            className="form-control me-2"
                            type="search"
                            placeholder="Search"
                            aria-label="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="btn btn-outline-success" type="submit">חפש</button>
                    </form>
                    {user ? (
                        <button className="btn btn-outline-danger ms-2" onClick={handleLogoutClick}>התנתק</button>
                    ) : (
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <Link className="nav-link" to="/login">התחבר</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/register">הירשם</Link>
                            </li>
                        </ul>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;