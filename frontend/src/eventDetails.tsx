import React, { useEffect, useState } from 'react';
import { useAppContext } from './AppContext';
import { getDoc, doc, Timestamp, updateDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
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
  const { eventId } = useParams<{ eventId: string }>(); // Get eventId from URL
  const { eventsCollectionRef, usersCollectionRef, profileCt } = useAppContext();
  const [event, setEvent] = useState<Event | null>(null);
  const [organizerProfile, setOrganizerProfile] = useState<OrganizerProfile | null>(null);

  useEffect(() => {
    // Fetch the event details
    const fetchEvent = async () => {
      if (eventId) {
        const eventDoc = doc(eventsCollectionRef, eventId);
        const docSnap = await getDoc(eventDoc);
        if (docSnap.exists()) {
          const eventData = { ...docSnap.data(), id: docSnap.id } as Event;
          setEvent(eventData);

          // Fetch the organizer's profile once the event is loaded
          fetchOrganizerProfile(eventData.organizer);
        } else {
          console.log("No such document!");
        }
      }
    };

    // Fetch the organizer's profile from usersCollectionRef
    const fetchOrganizerProfile = async (organizerId: string) => {
      const organizerDoc = doc(usersCollectionRef, organizerId);
      const docSnap = await getDoc(organizerDoc);
      if (docSnap.exists()) {
        setOrganizerProfile({ ...docSnap.data(), id: docSnap.id } as OrganizerProfile);
      } else {
        console.log("Organizer profile not found");
      }
    };

    fetchEvent();
  }, [eventId, eventsCollectionRef, usersCollectionRef]);

  const updateAttendees = async () => {
    if (event && eventId) {
      const eventDoc = doc(eventsCollectionRef, eventId);

      // Add the new attendee to the list of attendees
      const updatedAttendees = [...event.attendees, profileCt!.id];

      // Update the event document with the new attendees list
      await updateDoc(eventDoc, { attendees: updatedAttendees });

      // Update the local state to reflect the change
      setEvent((prevEvent) =>
        prevEvent ? { ...prevEvent, attendees: updatedAttendees } : prevEvent
      );
    }
  };

  if (!event) {
    return <p>Loading event details...</p>;
  }

  const isUserAttending = profileCt && event.attendees.includes(profileCt!.id);

  return (
    <div>
        <>
        <Navbar/>
      <div className="event-details-container">
        <div className="poster-container">
            <img src={event.pic} alt="Event poster" className="event-poster" />
        </div>
        <div className="details-container">
            <h1>Event: {event.name}</h1>
            <p>Description: {event.description}</p>
            <p>
            Date:{' '}
            {event.date.toDate().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })}
            </p>
            <p>
            Attendees: {event.attendees.length} / {event.maxAttendees}
            </p>
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
                <p style={{margin: "5px 0"}}>{organizerProfile?.bio}</p>
            </div>
            </div>

            {!isUserAttending && event.attendees.length < event.maxAttendees ? (
            <button onClick={updateAttendees} className="join">join event!</button>
            ) : isUserAttending ? (
            <h4>already joined event!</h4>
            ) : (
            <h4>event full sorry 😭</h4>
            )}
        </div>
        </div>
      </>
    </div>
  );
};

export default EventDetails;
