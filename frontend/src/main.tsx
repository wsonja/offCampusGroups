import React from 'react';
import ReactDOM from 'react-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import EventDetails from './eventDetails';
import { AppProvider } from './AppContext';

ReactDOM.render(
    <GoogleOAuthProvider clientId="209207942162-cjgr4d0qf0depkdevdmi4f3m084ft4sa.apps.googleusercontent.com">
        <React.StrictMode>
          <AppProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/events/:eventId" element={<EventDetails />} />
                </Routes>
            </BrowserRouter>
          </AppProvider>    
        </React.StrictMode>
    </GoogleOAuthProvider>,
    document.getElementById('root')
);
