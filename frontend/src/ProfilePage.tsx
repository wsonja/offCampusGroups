/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from 'react';
import { useAppContext } from './AppContext';
import { useNavigate } from 'react-router-dom';
import { getDocs, doc, updateDoc, query, where } from 'firebase/firestore'; // Import Firestore methods
import { db } from './firebase-config'; // Import your Firebase configuration
import './ProfilePage.css';
import Navbar from './components/Navbar';
import {Event} from "./eventDetails";

function ProfilePage() {
  const { eventsCollectionRef, profileCt, setProfileCt } = useAppContext();
  const navigate = useNavigate();
  const [bio, setBio] = useState(profileCt ? profileCt.bio : '');
  const [isSaving, setIsSaving] = useState(false);
  const [joinedEvents, setJoinedEvents] = useState<any[]>([]);

  if (!profileCt) return <p>Loading profile...</p>;
    
    // Function to display the user's joined events
    useEffect(() => {
      const fetchJoinedEvents = async () => {
          if (profileCt) {
              try {
                  // Find the user by email to get their joined events
                  const userJoinedEventsQuery = query(
                      eventsCollectionRef,
                      where("joinedUsers", "array-contains", profileCt.email) 
                  );
                  const querySnapshot = await getDocs(userJoinedEventsQuery);
                  const joinedEvents = querySnapshot.docs.map((doc) => ({
                      ...doc.data(),
                      id: doc.id,
                  }));
                  setJoinedEvents(joinedEvents); // Set only the events the user has joined
              } catch (error) {
                  console.error("Error fetching joined events:", error);
              }
          }
      };
  
      fetchJoinedEvents();
    }, [profileCt, eventsCollectionRef]);
  
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

      <div className="joined-events-container" style={{ marginTop: '20px' }}>
        <h3>Joined Events 🗓️</h3>
        {joinedEvents.length > 0 ? (
          <div className="events-list">
            {joinedEvents.map((event : Event) => (
              <div key={event.id} className="home-event-card">
                <div className="home-event-date">
                  <p className="home-event-month">{event.date.toDate().toLocaleString('en-US', { month: 'short' }).toUpperCase()}</p>
                  <p className="home-event-day">{event.date.toDate().getDate()}</p>
                </div>
                <div className="home-event-details">
                  <p>{event.date.toDate().toLocaleString('en-US', { weekday: 'short' })} • {event.date.toDate().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</p>
                  <h3>{event.name}</h3>
                  <p>{event.location}</p>
                </div>
                <div className="tags-container">
                  {event.tags.map((tag : string) => (
                    <span 
                      key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <button onClick={() => navigate(`/event/${event.id}`)} className="event-details-button">
                  More Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>You haven't joined any events yet ☹️</p>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
