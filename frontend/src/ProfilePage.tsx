import React, { useState } from 'react';
import { useAppContext } from './AppContext';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

function ProfilePage() {
  const { profileCt, setProfileCt } = useAppContext();
  const navigate = useNavigate();
  const [bio, setBio] = useState(profileCt ? profileCt.bio : '');

  if (!profileCt) return <p>Loading profile...</p>;
    // Function to save the updated bio to the context
  const handleSaveBio = () => {
    if (setProfileCt) {
      setProfileCt({ ...profileCt, bio });
    }
  };
  return (
    <div>
      <h2>Profile</h2>
      <p>Name: {profileCt.name}</p>
      <p>Email: {profileCt.email}</p>
      <p>Bio: {profileCt.bio}</p>
      <img src={profileCt.url} width="100px" alt="Profile" />
      <p>Fetched from Firebase 🔥</p>
      {/* Editable bio field */}
      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Edit your bio"
          style={{ marginRight: '8px' }}
        />
        <button onClick={handleSaveBio}>Save</button>
      </div>
      {/* Back to Home Button */}
      <button onClick={() => navigate('/')} className="back-button">
        Back to Home
      </button>
    </div>
  );
}

export default ProfilePage;
