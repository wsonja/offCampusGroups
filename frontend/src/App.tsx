/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import {getDocs} from 'firebase/firestore'
import { useAppContext } from './AppContext';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import Icon from './components/icon'
import { Link } from 'react-router-dom';


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
                url: profile.picture || '',
                id: users.find((user) => user.email === profile.email)?.id || '',
            });
        }
    }, [profile, users, setProfileCt]);
    

    // log out function to log the user out of google and set the profile array to null
    const logOut = () => {
        googleLogout();
        setProfile(null);
        setProfileCt(null);
    };

    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
        console.log("hihi")
    };

    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const handleTagClick = (tag: string) => {
        setSelectedTags((prev) => {
            // Check if the tag is already in the array
            if (prev.includes(tag)) {
              // If it is, remove it (deselect)
              return prev.filter((t) => t !== tag);
            } else {
              // Otherwise, add it to the array
              console.log(selectedTags + " " + tag)
              return [...prev, tag];
            }
          });
        
        console.log(selectedTags);
      };
    
      // Filter events to only show those with at least one selected tag
      const filteredEvents = selectedTags.length
        ? events.filter((event) =>
            event.tags.some((tag:string) => selectedTags.includes(tag))
          )
        : events;
    


    return (
        <div className="center">
            <div className="header">
                <img src="/src/assets/logo.png" alt="Off Campus Groups Logo" className="logo" />
                <h2>off campus groups &nbsp;👯👯</h2>
            </div>

            {/* <h2>off campus groups </h2> */}
            {profileCt && profileCt.name ? (
                <div style={{ paddingBottom: '20px' }}>
                    <div style={{ position: "relative" }}> {/* Make this div relative for dropdown positioning */}
                        <button onClick={toggleMenu} className="account-icon-button">
                            <img src={profileCt.url} alt="Profile" className="profile-image" />
                        </button>
                        {isOpen && (
                            <div className="dropdown-menu">
                            <ul>
                                <li><Link to="/profile" onClick={() => setIsOpen(false)}>My Profile</Link></li>
                                <li onClick={logOut}>Log out</li>
                            </ul>
                            </div>
                        )}
                    </div>
                    {/* <img src={profileCt.url} alt="user image" />
                    <h3>User Logged in</h3>
                    <p>Name: {profileCt.name}</p>
                    <p>Email Address: {profileCt.email}</p>
                    <p>fetched from google 🚀</p> */}
                    <p style={{paddingTop: "1px"}}>welcome, {profileCt.name} 🔥</p>
                    {/* <p>Email: {profileCt.email}</p>
                    <p>Bio: {profileCt.bio}</p>
                    <img src={profileCt.url} width="100px" alt="firebase profile" />
                    <p>fetched from firebase 🔥</p>
                    <br /> */}
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
                            {selectedTags[event.id] && (
                                <p>Selected Tag for {event.title}: {selectedTags[event.id]}</p>
                            )}
                            <button onClick={() => handleEventClick(event.id)} className="event-details-button">go to event details</button>
                        </div>
                    ))}

                </div>
            ) : (
                <div className="centerlogin">
                    <img src="/src/assets/biggerlogo.png" alt="Profile" className="biglogo" />
                    <br/>
                    <button onClick={() => login()} className="google-button"> <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google icon" className="google-icon" /> Sign in with Google 🚀</button>
                </div>
            )}
        </div>
    );
    
}
export default App;