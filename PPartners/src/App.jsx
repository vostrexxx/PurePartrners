import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import IdentificationPage from './Components/Pages/Identification/IdentificationPage';
import LoginPage from './Components/Pages/Login/LoginPage';
import PhoneNumberEnteringPage from './Components/Pages/PasswordReset/PhoneNumberEnterPage';
import EnterCodePage from './Components/Pages/PasswordReset/PasscodeEnterPage';
import PasswordResetPage from './Components/Pages/PasswordReset/PasswordResetPage';
import RegistrationPage from './Components/Pages/Registration/RegistrationPage';
import MainPage from './Components/Pages/Main/MainPage';
import ProfilePage from './Components/Pages/Profile/ProfilePage';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<IdentificationPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegistrationPage />} />
                <Route path="/main" element={<MainPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/PhoneEnter" element={<PhoneNumberEnteringPage />} />
                <Route path="/PasscodeEnter" element={<EnterCodePage />} />
                <Route path="/PasswordReset" element={<PasswordResetPage />} />
            </Routes>
        </Router>
    );
};

export default App;
