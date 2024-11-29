/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { getDocs, setDoc, doc, addDoc} from 'firebase/firestore';
import { db } from './firebase-config';
import { useAppContext } from './AppContext';
import { useNavigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';


function App() {
    const { usersCollectionRef, eventsCollectionRef, profileCt, setProfileCt } = useAppContext();
    const [user, setUser] = useState(() => {
        // Load user data from localStorage on app load
        const savedUser = localStorage.getItem('googleUser');
        return savedUser ? JSON.parse(savedUser) : null;
      });
    const [profile, setProfile] = useState<any | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const navigate = useNavigate();
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [eventData, setEventData] = useState({
        name: '',
        date: '',
        description: '',
        location: '',
        maxAttendees: '',
        pic: '',
        tags: '',
    });

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEventData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Save the event to Firebase
    const handleSaveEvent = async () => {
        try {
        // Convert tags to an array
        const tagsArray = eventData.tags.split(',').map((tag) => tag.trim());

        // Add event to Firestore
        await addDoc(eventsCollectionRef, {
            ...eventData,
            tags: tagsArray,
            attendees: [profileCt?.id], // Start with only organizer
            organizer: profileCt?.id, // Use current user's ID as the organizer
            date: new Date(eventData.date), // Convert date to a Date object
        });

        alert('Event added successfully!');
        setEventData({
            name: '',
            date: '',
            description: '',
            location: '',
            maxAttendees: '',
            pic: '',
            tags: '',
        }); // Reset the form
        setIsPopupOpen(false); // Close the popup
        } catch (error) {
        console.error('Error adding event:', error);
        alert('Failed to add event. Please try again.');
        }
    };

    const handleEventClick = (eventId: string) => {
        navigate(`/events/${eventId}`);
    };

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => {
          // Save user to state and localStorage
          setUser(codeResponse);
          localStorage.setItem('googleUser', JSON.stringify(codeResponse));
        },
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
            console.log(data)
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
    // const logOut = () => {
    //     googleLogout();
    //     setProfile(null);
    //     setProfileCt(null);
    // };

    // const [isOpen, setIsOpen] = useState(false);

    // const toggleMenu = () => {
    //     setIsOpen(!isOpen);
    //     console.log("Menu toggled");
    // };

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
                <div>
                    <div className='eventAdd'>
                        <h1>EVENTS 🗓️</h1>
                        {/* Button to open the popup */}
                        <button
                            onClick={() => setIsPopupOpen(true)}
                            className='addEventButton'
                        >
                            add event
                        </button>

                        {/* Popup Form */}
                        {isPopupOpen && (
                            <div
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                            >
                            <div
                                style={{
                                backgroundColor: '#fff',
                                padding: '20px',
       
                                borderRadius: '10px',
                                width: '400px',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                }}
                            >
                                <h2>add event</h2>
                                <form>
                                <div style={{ marginBottom: '10px', marginTop: '15px' }}>
                                    <label>Event Name:</label>
                                    <input
                                    type="text"
                                    name="name"
                                    value={eventData.name}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '90%',
                                        padding: '8px',
                                        marginTop: '5px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                    }}
                                    />
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <label>Date:</label>
                                    <input
                                    type="datetime-local"
                                    name="date"
                                    value={eventData.date}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '90%',
                                        padding: '8px',
                                        marginTop: '5px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                    }}
                                    />
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <label>Description:</label>
                                    <input
                                    type="text"
                                    name="description"
                                    value={eventData.description}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '90%',
                                        padding: '8px',
                                        marginTop: '5px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                    }}
                                    />
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <label>Location:</label>
                                    <input
                                    type="text"
                                    name="location"
                                    value={eventData.location}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '90%',
                                        padding: '8px',
                                        marginTop: '5px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                    }}
                                    />
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <label>Max Attendees:</label>
                                    <input
                                    type="number"
                                    name="maxAttendees"
                                    value={eventData.maxAttendees}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '90%',
                                        padding: '8px',
                                        marginTop: '5px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                    }}
                                    />
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <label>Event Picture URL:</label>
                                    <input
                                    type="text"
                                    name="pic"
                                    value={eventData.pic}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '90%',
                                        padding: '8px',
                                        marginTop: '5px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                    }}
                                    />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label>Tags (comma-separated):</label>
                                    <input
                                    type="text"
                                    name="tags"
                                    value={eventData.tags}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '90%',
                                        padding: '8px',
                                        marginTop: '5px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                    }}
                                    />
                                </div>
                                </form>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button
                                    onClick={() => setIsPopupOpen(false)}
                                    style={{
                                    padding: '10px 15px',
                                    backgroundColor: '#ccc',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    }}
                                >
                                    cancel
                                </button>
                                <button
                                    onClick={handleSaveEvent}
                                    style={{
                                    padding: '10px 15px',
                                    backgroundColor: '#0056b3',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    
                                    textAlign: 'center',
                                    margin: 0,
                                    fontWeight: 'bold',
                                    }}
                                >
                                    save
                                </button>
                                </div>
                            </div>
                            </div>
                        )}
                    </div>
                    {filteredEvents.map((event) => (
                        <div key={event.id} className="home-event-card">
                            <div className="home-event-date">
                                <p className="home-event-month">{event.date.toDate().toLocaleString('en-US', { month: 'short' }).toUpperCase()}</p>
                                <p className="home-event-day">{event.date.toDate().getDate()}</p>
                            </div>
                            <div className="home-event-details">
                                <p>{event.date.toDate().toLocaleString('en-US', { weekday:'short'})} • {event.date.toDate().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</p>
                                <h3>{event.name}</h3>
                                <p>{event.location}</p>
                                
                            </div>
                            <div className="tags-container">
                                    {event.tags.map((tag: string) => (
                                        <span
                                            key={tag}
                                            className={`tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
                                            onClick={() => handleTagClick(tag)}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            <button onClick={() => handleEventClick(event.id)} className="event-details-button">
                                more details
                            </button>
                        </div>
                    ))}

                    


                </div>
            ) : (
                <div className="centerlogin">
                    <img src="/assets/biggerlogo.png" alt="Profile" className="biglogo" />
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
