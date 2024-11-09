import React from 'react'
import ReactDOM from 'react-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

ReactDOM.render(
    <GoogleOAuthProvider clientId="209207942162-cjgr4d0qf0depkdevdmi4f3m084ft4sa.apps.googleusercontent.com">
        <React.StrictMode>
            <App />
        </React.StrictMode>
    </GoogleOAuthProvider>,
    document.getElementById('root')
);