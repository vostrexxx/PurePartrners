import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import IdentificationPage from './Components/Pages/Identification/IdentificationPage';
import LoginPage from './Components/Pages/Login/LoginPage';
import RegistrationPage from './Components/Pages/Registration/RegistrationPage';
import MainPage from './Components/Pages/Main/MainPage'; 

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<IdentificationPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegistrationPage />} />
                <Route path="/main" element={<MainPage />} /> 
            </Routes>
        </Router>
    );
};

export default App;
