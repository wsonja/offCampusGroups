/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import {db} from "./firebase-config";
import {collection, getDocs} from 'firebase/firestore'


function App() {
    const [ user, setUser ] = useState([]);
    const [ profile, setProfile ] = useState([]);
    const usersCollectionRef = collection(db, "users")
    const eventsCollectionRef = collection(db, "events")
    const [users, setUsers] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => setUser(codeResponse),
        onError: (error) => console.log('Login Failed:', error)
    });

    useEffect(
        () => {
            if (user) {
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

            const getUsers = async() => {
                const data = await getDocs(usersCollectionRef);
                console.log(data);
                setUsers(data.docs.map((doc)=>({...doc.data(), id: doc.id})));
            };
            getUsers();
            
            const getEvents = async() => {
                const data = await getDocs(eventsCollectionRef);
                console.log(data);
                setEvents(data.docs.map((doc)=>({...doc.data(), id: doc.id})));
            };
            getEvents();
        },
        [ user ]
    );

    // log out function to log the user out of google and set the profile array to null
    const logOut = () => {
        googleLogout();
        setProfile(null);
    };

    return (
        <div>
            <h2>off campus groups 👯👯</h2>
            <br />
            {profile ? (
                <div>
                    <img src={profile.picture} alt="user image" />
                    <h3>User Logged in</h3>
                    <p>Name: {profile.name}</p>
                    <p>Email Address: {profile.email}</p>
                    <p>fetched from google 🚀</p>
                    <br />
  
                    {users.find((user) => user.email === profile.email) ? (
                        <div>
                            <p>Name: {users.find((user) => user.email === profile.email)?.name}</p>
                            <p>Email: {users.find((user) => user.email === profile.email)?.email}</p>
                            <p>Bio: {users.find((user) => user.email === profile.email)?.bio}</p>
                            <img src={users.find((user) => user.email === profile.email)?.url} width="100px"></img>
                            <p>fetched from firebase 🔥</p>
                        </div>
                        ) : (
                        <p>No user found with the specified email.</p>
                        )
                    }
                    <br />
                    <br />
                    <h1>EVENTS 🗓️</h1>
                    {events.map((event) => {
                        return (
                        <div>
                            {" "}
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
                            <img src={event.pic} width="200px"></img>
                            <p>Tags: {event.tags}</p>
                        </div>
                        );
                    })}
                    <button onClick={logOut}>Log out</button>
                </div>
            ) : (
                <button onClick={login}>Sign in with Google 🚀 </button>
            )}
        </div>
    );
}
export default App;