import React, { useState } from 'react';
import { useAppContext } from './AppContext';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore'; // Import Firestore methods
import { db } from './firebase-config'; // Import your Firebase configuration
import './ProfilePage.css';

function ProfilePage() {
  const { profileCt, setProfileCt } = useAppContext();
  const navigate = useNavigate();
  const [bio, setBio] = useState(profileCt ? profileCt.bio : '');
  const [isSaving, setIsSaving] = useState(false);

  if (!profileCt) return <p>Loading profile...</p>;
    // Function to save the updated bio to the context
  
    // Function to save the updated bio to context and Firebase
  const handleSaveBio = async () => {
    if (setProfileCt) {
      setIsSaving(true);

      // Update in the local context
      setProfileCt({ ...profileCt, bio });

      try {
        // Update in Firebase
        console.log(profileCt.id)
        const userDoc = doc(db, 'users', profileCt.id); // Assuming `profileCt.id` is the user's document ID
        await updateDoc(userDoc, { bio });

        console.log('Bio updated successfully in Firebase');
      } catch (error) {
        console.error('Error updating bio in Firebase:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };



  return (
    <div>
      <h2>Profile</h2>
      <p>Name: {profileCt.name}</p>
      <p>Email: {profileCt.email}</p>
      <p>Bio: {profileCt.bio}</p>
      <img src={profileCt.url} width="100px" alt="Profile" />
      <p>ID:{profileCt.id}</p>
      <p>Fetched from Firebase 🔥</p>
      {/* Editable bio field with modern styling */}
      <div className="input-container">
        <input
          type="text"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Edit your bio"
          className="input-field"
        />
        <button onClick={handleSaveBio} disabled={isSaving} className="save-button">
          {isSaving ? 'saving...' : 'edit bio'}
        </button>
      </div>
      {/* Back to Home Button */}
      <button onClick={() => navigate('/')} className="back-button">
        Back to Home
      </button>
    </div>
  );
}

export default ProfilePage;
