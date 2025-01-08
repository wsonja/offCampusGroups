import React, { useEffect, useState } from 'react';
import { useAppContext } from './AppContext';
import { getDoc, doc, Timestamp, updateDoc, arrayRemove, deleteDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import "./App.css";
import "./eventDetails.css";
import Navbar from './components/Navbar';

export interface Event {
  id: string;
  name: string;
  description: string;
  date: Timestamp;
  attendees: string[];
  maxAttendees: number;
  pic: string;
  tags: string[];
  organizer: string;
  location: string;
}

interface OrganizerProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  url: string;
}

const EventDetails: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>(); 
  const { eventsCollectionRef, usersCollectionRef, profileCt } = useAppContext();
  const [event, setEvent] = useState<Event | null>(null);
  const [organizerProfile, setOrganizerProfile] = useState<OrganizerProfile | null>(null);
  const [attendeesProfiles, setAttendeesProfiles] = useState<OrganizerProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<OrganizerProfile | null>(null); // For the modal popup
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();

  const fetchAttendeesProfiles = async (attendees: string[]) => {
    try {
      const profiles: OrganizerProfile[] = [];
      for (const attendeeId of attendees) {
        const userDoc = doc(usersCollectionRef, attendeeId);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          profiles.push({ ...docSnap.data(), id: docSnap.id } as OrganizerProfile);
        }
      }
      setAttendeesProfiles(profiles);
    } catch (error) {
      console.error("Error fetching attendees:", error);
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      if (eventId) {
        const eventDoc = doc(eventsCollectionRef, eventId);
        const docSnap = await getDoc(eventDoc);
        if (docSnap.exists()) {
          const eventData = { ...docSnap.data(), id: docSnap.id } as Event;
          setEvent(eventData);
          fetchOrganizerProfile(eventData.organizer);
          fetchAttendeesProfiles(eventData.attendees);
        } else {
          console.log("No such document!");
        }
      }
    };

    const fetchOrganizerProfile = async (organizerId: string) => {
      const organizerDoc = doc(usersCollectionRef, organizerId);
      const docSnap = await getDoc(organizerDoc);
      if (docSnap.exists()) {
        setOrganizerProfile({ ...docSnap.data(), id: docSnap.id } as OrganizerProfile);
      }
    };

    fetchEvent();
  }, [eventId, eventsCollectionRef, usersCollectionRef]);

  const updateAttendees = async () => {
    if (event && eventId) {
      const eventDoc = doc(eventsCollectionRef, eventId);
      const updatedAttendees = [...event.attendees, profileCt!.id];
      await updateDoc(eventDoc, { attendees: updatedAttendees });
      setEvent({ ...event, attendees: updatedAttendees });
      fetchAttendeesProfiles(updatedAttendees);
    }
  };

  const removeAttendee = async () => {
    if (event && eventId) {
      const eventDoc = doc(eventsCollectionRef, eventId);
      await updateDoc(eventDoc, {
        attendees: arrayRemove(profileCt!.id),
      });
      const updatedAttendees = event.attendees.filter(a => a !== profileCt?.id);
      setEvent({ ...event, attendees: updatedAttendees });
      fetchAttendeesProfiles(updatedAttendees);
    }
  };

  const deleteEvent = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      const eventDocRef = doc(eventsCollectionRef, eventId!);
      await deleteDoc(eventDocRef);
      navigate('/');
    }
  };

  const openProfileModal = (profile: OrganizerProfile) => {
    setSelectedProfile(profile);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setSelectedProfile(null);
    setShowProfileModal(false);
  };

  if (!event) return <p>Loading event details...</p>;

  const isUserAttending = profileCt && event.attendees.includes(profileCt!.id);

  return (
    <div>
      <Navbar />
      <div className="event-details-container">
        <div className="poster-container">
          <img src={event.pic} alt="Event poster" className="event-poster" />
        </div>
        <div className="details-container">
          <h1>Event: {event.name}</h1>
          <p>Description: {event.description}</p>
          <p>
            Date: {event.date.toDate().toLocaleString()}
          </p>
          <p>Attendees: {event.attendees.length} / {event.maxAttendees}</p>
          <p style={{marginBottom: "0"}}>Organizer: {organizerProfile?.name}</p>
            <div className="organizer-profile">
            <img src={organizerProfile?.url} alt="Organizer profile" className="organizer-profile-image" />
            <div className="organizer-info">
                <h4>{organizerProfile?.name}</h4>
                <p style={{margin: "5px 0"}}>
                <a href={`mailto:${organizerProfile?.email}`} className="email-link">
                    {organizerProfile?.email}
                </a>
                </p>
            </div>
            </div>
          
          {/* Attendees Row */}
          <h3 style={{marginBottom: "10px"}}>Attendees:</h3>
          <div className="attendees-row">
            {attendeesProfiles.map((attendee) => (
              <img
                key={attendee.id}
                src={attendee.url}
                alt={attendee.name}
                className="attendee-profile-pic"
                onClick={() => openProfileModal(attendee)}
                style={{ cursor: 'pointer', borderRadius: '50%', width: '60px', margin: '5px' }}
              />
            ))}
          </div>

          {/* Centered Popup Modal */}
          {showProfileModal && selectedProfile && (
            <div className="modal-overlay">
              <div className="modal-content">
                <button className="close-button" onClick={closeProfileModal}>X</button>
                <img
                  src={selectedProfile.url}
                  alt={selectedProfile.name}
                  className="modal-profile-pic"
                />
                <h2>{selectedProfile.name}</h2>
                <p>Email: <a href={`mailto:${selectedProfile.email}`}>{selectedProfile.email}</a></p>
                <p>Bio: {selectedProfile.bio}</p>
              </div>
            </div>
          )}

          {profileCt?.email === organizerProfile?.email ? (
            <button onClick={deleteEvent} className='join'>Delete Event</button>
          ) : !isUserAttending && event.attendees.length < event.maxAttendees ? (
            <button onClick={updateAttendees} className="join">Join Event!</button>
          ) : isUserAttending ? (
            <button onClick={removeAttendee} className="join">Remove Me from Event!</button>
          ) : (
            <h4>Event is full.</h4>
          )}
        </div>
      </div>

      
    </div>
  );
};

export default EventDetails;
