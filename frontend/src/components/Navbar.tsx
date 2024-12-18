import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import { useAppContext } from "../AppContext";
import "./Navbar.css"; // Create a CSS file for Navbar-specific styles

const Navbar: React.FC = () => {
  const { profileCt, setProfileCt } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const logOut = () => {
    googleLogout(); // Logs out the user from Google
    setProfileCt(null); // Clear user profile state
    localStorage.removeItem("googleUser"); // Clear localStorage data
    navigate("/"); // Redirect to the home page
    window.location.reload(); // Forcefully reload the page
  };

  return (
    <div className="navbar">
      <div className="link-container">
        <Link to="/" className="header-link">
          <div className="header">
            <img
              src="/assets/logo.png"
              alt="Off Campus Groups Logo"
              className="logo"
            />
            <h2>off campus groups &nbsp;👯👯</h2>
          </div>
        </Link>
      </div>
      {profileCt && (
        <>
          <p className="welcome-message">welcome, {profileCt.name} 🔥</p>
          <div className="account-container">
            <button onClick={toggleMenu} className="account-icon-button">
              <img
                src={profileCt.url}
                alt="Profile"
                className="profile-image"
              />
            </button>
            {isOpen && (
              <div className="dropdown-menu">
                <ul>
                  <li>
                    <Link
                      to="/"
                      onClick={() => setIsOpen(false)}
                      style={{ color: "black", textDecoration: "none" }}
                    >
                      home
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      style={{ color: "black", textDecoration: "none" }}
                    >
                      my profile
                    </Link>
                  </li>
                  <li onClick={logOut}>log out</li>
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
