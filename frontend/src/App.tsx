/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { getDocs, addDoc, setDoc, doc, query, where } from 'firebase/firestore';
import { db } from './firebase-config';
import { useAppContext } from './AppContext';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import Icon from './components/icon';
import { Link } from 'react-router-dom';
import Navbar from './components/Navbar';

function App() {
    const { usersCollectionRef, eventsCollectionRef, profileCt, setProfileCt } = useAppContext();
    const [user, setUser] = useState<any[]>([]);
    const [profile, setProfile] = useState<any | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const navigate = useNavigate();

    const handleEventClick = (eventId: string) => {
        navigate(`/events/${eventId}`);
    };

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => setUser(codeResponse),
        onError: (error) => console.log('Login Failed:', error),
    });

    // Fetch Google profile data
    useEffect(() => {
        if (user && user.access_token) {
            axios
                .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                    headers: {
                        Authorization: `Bearer ${user.access_token}`,
                        Accept: 'application/json',
                    },
                })
                .then((res) => {
                    setProfile(res.data);
                })
                .catch((err) => console.log(err));
        }
    }, [user]);

    // Fetch users and events from Firestore
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

    // Check if user exists in Firestore; if not, add them
    useEffect(() => {
        const checkAndAddUser = async () => {
            if (profile) {
                // Check if user exists in Firestore
                const userExists = users.some((user) => user.email === profile.email);
    
                if (!userExists) {
                    try {
                        // Sanitize email for use as Firestore document ID
                        const emailId = profile.email.split("@")[0];
    
                        await setDoc(doc(db, "users", emailId), {
                            name: profile.name,
                            email: profile.email,
                            bio: '', // Set a default bio or prompt user to complete it later
                            url: profile.picture || '', // Store the Google profile picture URL
                        });
    
                        console.log("New user added to Firestore with ID:", emailId);
    
                        // Re-fetch the users after adding the new user
                        const data = await getDocs(usersCollectionRef);
                        setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
                    } catch (error) {
                        console.error("Error adding new user:", error);
                    }
                }
            }
        };
    
        checkAndAddUser();
    }, [profile, users, usersCollectionRef]);

    // Set profile in context
    useEffect(() => {
        if (profile) {
            setProfileCt({
                name: profile.name,
                email: profile.email,
                bio: users.find((user) => user.email === profile.email)?.bio || '',
                url: profile.picture || '',
                id: users.find((user) => user.email === profile.email)?.id || '',
            });
        }
    }, [profile, users, setProfileCt]);

    // Logout function
    const logOut = () => {
        googleLogout();
        setProfile(null);
        setProfileCt(null);
    };

    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
        console.log("Menu toggled");
    };

    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const handleTagClick = (tag: string) => {
        setSelectedTags((prev) => {
            if (prev.includes(tag)) {
                return prev.filter((t) => t !== tag);
            } else {
                return [...prev, tag];
            }
        });
    };

    // Filter events based on selected tags
    const filteredEvents = selectedTags.length
        ? events.filter((event) => event.tags.some((tag: string) => selectedTags.includes(tag)))
        : events;

    return (
        <>
            <Navbar />
        <div className="center">
            {profileCt && profileCt.name ? (
                <div style={{ paddingBottom: '20px',paddingTop:'5px' }}>
                    {/* <p style={{ paddingTop: "1px" }}>welcome, {profileCt.name} 🔥</p> */}
                    <h1>EVENTS 🗓️</h1>
                    {filteredEvents.map((event) => (
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
                            <div className="tags-container">
                                {event.tags.map((tag) => (
                                    <div
                                        key={tag}
                                        className={`tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
                                        onClick={() => handleTagClick(tag)}
                                    >
                                        {tag}
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => handleEventClick(event.id)} className="event-details-button">go to event details</button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="centerlogin">
                    <img src="/src/assets/biggerlogo.png" alt="Profile" className="biglogo" />
                    <br />
                    <button onClick={() => login()} className="google-button">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google icon" className="google-icon" />
                        Sign in with Google 🚀
                    </button>
                </div>
            )}
        </div>
        
        </>
    );
}

export default App;
