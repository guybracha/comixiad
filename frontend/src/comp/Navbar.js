import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Navbar = () => {
    const { user } = useUser();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link className="navbar-brand" to="/">Comixiad</Link>
                <div className="collapse navbar-collapse">
                    <ul className="navbar-nav ml-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/upload">העלה קומיקס</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/register">הרשם</Link>
                        </li>
                        {user ? (
                            <li className="nav-item">
                                <span className="navbar-text text-light">
                                    ברוך הבא, {user.name}
                                </span>
                            </li>
                        ) : (
                            <li className="nav-item">
                                <Link className="nav-link" to="/login">התחבר</Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
