import React from 'react';
import { useAppContext } from './AppContext';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

function ProfilePage() {
  const { profileCt } = useAppContext();
  const navigate = useNavigate();

  if (!profileCt) return <p>Loading profile...</p>;

  return (
    <div>
      <h2>Profile</h2>
      <p>Name: {profileCt.name}</p>
      <p>Email: {profileCt.email}</p>
      <p>Bio: {profileCt.bio}</p>
      <img src={profileCt.url} width="100px" alt="Profile" />
      <p>Fetched from Firebase 🔥</p>

      {/* Back to Home Button */}
      <button onClick={() => navigate('/')} className="back-button">
        Back to Home
      </button>
    </div>
  );
}

export default ProfilePage;
