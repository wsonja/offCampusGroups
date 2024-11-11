/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import {getDocs} from 'firebase/firestore'
import { useAppContext } from './AppContext';
import React from 'react';
import { useNavigate } from 'react-router-dom';


function App() {
    const { usersCollectionRef, eventsCollectionRef, profileCt, setProfileCt } = useAppContext();
    const [ user, setUser ] = useState([]);
    const [ profile, setProfile ] = useState(null);
    const [users, setUsers] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const navigate = useNavigate();

    const handleEventClick = (eventId: string) => {
        navigate(`/events/${eventId}`);
    };

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => setUser(codeResponse),
        onError: (error) => console.log('Login Failed:', error)
    });

    useEffect(() => {
        if (user && user.access_token) {
            axios
                .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                    headers: {
                        Authorization: `Bearer ${user.access_token}`,
                        Accept: 'application/json'
                    }
                })
                .then((res) => {
                    setProfile(res.data);
                })
                .catch((err) => console.log(err));
        }
    }, [user]);
    
    useEffect(() => {
        const getUsers = async () => {
            const data = await getDocs(usersCollectionRef);
            setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        };
        getUsers();
    
        const getEvents = async () => {
            const data = await getDocs(eventsCollectionRef);
            setEvents(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        };
        getEvents();
    }, [usersCollectionRef, eventsCollectionRef]);
    
    useEffect(() => {
        if (profile) {
            setProfileCt({
                name: profile.name,
                email: profile.email,
                bio: users.find((user) => user.email === profile.email)?.bio || '',
                url: profile.picture || ''
            });
        }
    }, [profile, users, setProfileCt]);
    

    // log out function to log the user out of google and set the profile array to null
    const logOut = () => {
        googleLogout();
        setProfile(null);
        setProfileCt(null);
    };

    return (
        <div>
            <h2>off campus groups 👯👯</h2>
            <br />
            {profileCt && profileCt.name ? (
                <div>
                    <img src={profileCt.url} alt="user image" />
                    <h3>User Logged in</h3>
                    <p>Name: {profileCt.name}</p>
                    <p>Email Address: {profileCt.email}</p>
                    <p>fetched from google 🚀</p>
                    <br />
                    <p>Name: {profileCt.name}</p>
                    <p>Email: {profileCt.email}</p>
                    <p>Bio: {profileCt.bio}</p>
                    <img src={profileCt.url} width="100px" alt="firebase profile" />
                    <p>fetched from firebase 🔥</p>
                    <br />
                    <h1>EVENTS 🗓️</h1>
                    {events.map((event) => (
                        <div key={event.id}>
                            <h3>Event: {event.name}</h3>
                            <p>Description: {event.description}</p>
                            <p>Date: {event.date.toDate().toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}</p>
                            <p>Current attendees: {event.attendees.length} / {event.maxAttendees}</p>
                            <img src={event.pic} width="200px" alt="event" />
                            <p>Tags: {event.tags}</p>
                            <button onClick={() => handleEventClick(event.id)}>go to event details</button>
                        </div>
                    ))}
                    <button onClick={logOut}>Log out</button>
                </div>
            ) : (
                <button onClick={() => login()}>Sign in with Google 🚀</button>
            )}
        </div>
    );
    
}
export default App;