/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Routes, Route } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';


function App() {
    const responseMessage = (response) => {
        console.log(response);
    };
    const errorMessage = (error) => {
        console.log(error);
    };
  return (
    <div>
            <h2>React Google Login</h2>
            <br />
            <br />
            <GoogleLogin onSuccess={responseMessage} onError={errorMessage} />
    </div>
  );
}

export default App;