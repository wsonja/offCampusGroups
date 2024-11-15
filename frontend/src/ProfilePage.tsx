import React, { useState } from 'react';
import { useAppContext } from './AppContext';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore'; // Import Firestore methods
import { db } from './firebase-config'; // Import your Firebase configuration
import './ProfilePage.css';
import Navbar from './components/Navbar';

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
      <Navbar/>
      <div className="profile-page-container" style={{justifyContent: "center",display:"flex",flexDirection:"column"}}>
      <h2 style={{marginTop:"30px"}}>Profile</h2>
      <div className="profile-container">
        <img src={profileCt.url} width="100px" alt="Profile" className="pfp" />
        <p>Name: {profileCt.name}</p>
        <p>Email: {profileCt.email}</p>
        <p>Bio: {profileCt.bio}</p>

      </div>
      
      
      {/* <p>ID:{profileCt.id}</p>
      <p>Fetched from Firebase 🔥</p> */}

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
      </div>
    </div>
  );
}

export default ProfilePage;
