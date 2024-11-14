import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';
import { useAppContext } from '../AppContext';
import './Navbar.css'; // Create a CSS file for Navbar-specific styles

const Navbar: React.FC = () => {
    const { profileCt, setProfileCt } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const logOut = () => {
        googleLogout();
        setProfileCt(null);
        navigate('/'); // Redirect to home page after logging out
    };

    return (
        <div className="navbar">
            <Link to="/" className="header-link">
                <div className="header">
                    <img src="/src/assets/logo.png" alt="Off Campus Groups Logo" className="logo" />
                    <h2>off campus groups &nbsp;👯👯</h2>
                </div>
            </Link>
            {profileCt && (
                <>
                <p className="welcome-message">welcome, {profileCt.name} 🔥</p>
                <div className="account-container" style={{ position: "relative" }}>
                    <button onClick={toggleMenu} className="account-icon-button">
                        <img src={profileCt.url} alt="Profile" className="profile-image" />
                    </button>
                    {isOpen && (
                        <div className="dropdown-menu">
                            <ul>
                                <li><Link to="/profile" onClick={() => setIsOpen(false)}>My Profile</Link></li>
                                <li onClick={logOut}>Log out</li>
                            </ul>
                        </div>
                    )}
                </div>
                </>
            )}
        </div>
    );
};

export default Navbar;
