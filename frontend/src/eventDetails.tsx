import React, { useEffect, useState } from 'react';
import { useAppContext } from './AppContext';
import { getDoc, doc, Timestamp, updateDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import "./App.css"

interface Event {
  id: string;
  name: string;
  description: string;
  date: Timestamp; // Or use `Timestamp` from Firebase if applicable
  attendees: string[]; // Define a more specific type if possible
  maxAttendees: number;
  pic: string;
  tags: string;
}

const EventDetails: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>(); // Get eventId from URL
    const { eventsCollectionRef, profileCt } = useAppContext();
    const [event, setEvent] = useState<Event | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
      const fetchEvent = async () => {
        if (eventId) {
          const eventDoc = doc(eventsCollectionRef, eventId);
          const docSnap = await getDoc(eventDoc);
          if (docSnap.exists()) {
            setEvent({ ...docSnap.data(), id: docSnap.id } as Event);
          } else {
            console.log("No such document!");
          }
        }
      };
  
      fetchEvent();
    }, [eventId, eventsCollectionRef]);

    const updateAttendees = async () => {
        if (event && eventId) {
          const eventDoc = doc(eventsCollectionRef, eventId);
    
          // Add the new attendee to the list of attendees
          const updatedAttendees = [...event.attendees, profileCt!.email.split("@")[0]];
    
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

    const isUserAttending = profileCt && event.attendees.includes(profileCt!.email.split("@")[0]);
  
    return (
      <div>
        <h1>Event Details</h1>
        {/* <h3>{profileCt ? (profileCt.name + " logged in") : ("no user logged in")}</h3> */}
        <h3>Event: {event.name}</h3>
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
        <img src={event.pic} width="200px" alt="Event" />
        <p>Tags: {event.tags}</p>

        {!isUserAttending ? (
        <button onClick={updateAttendees}>join event!</button>
      ): <h4>already joined event!</h4>}

        <button className="event-details-button" onClick={() => navigate('/')}>back to main page</button>

      </div>
    );
  };
  
  export default EventDetails;
