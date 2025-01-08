import React from 'react';
import ReactDOM from 'react-dom/client';  // Updated import for createRoot
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import EventDetails from './eventDetails';
import { AppProvider } from './AppContext';
import ProfilePage from "./ProfilePage";

// Use createRoot instead of ReactDOM.render
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <GoogleOAuthProvider clientId="209207942162-cjgr4d0qf0depkdevdmi4f3m084ft4sa.apps.googleusercontent.com">
        <React.StrictMode>
          <AppProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/events/:eventId" element={<EventDetails />} />
                    <Route path="/profile" element={<ProfilePage />} />
                </Routes>
            </BrowserRouter>
          </AppProvider>    
        </React.StrictMode>
    </GoogleOAuthProvider>
);
