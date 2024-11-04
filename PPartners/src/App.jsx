import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NonAuthMainPage from './Components/Pages/Main/NonAuthMainPage';
import IdentificationPage from './Components/Pages/Identification/IdentificationPage';
import LoginPage from './Components/Pages/Login/LoginPage';
import PhoneNumberEnteringPage from './Components/Pages/PasswordReset/PhoneNumberEnterPage';
import EnterCodePage from './Components/Pages/PasswordReset/PasscodeEnterPage';
import PasswordResetPage from './Components/Pages/PasswordReset/PasswordResetPage';
import RegistrationPage from './Components/Pages/Registration/RegistrationPage';
import MainPage from './Components/Pages/Main/MainPage';
import ProfilePage from './Components/Pages/Profile/ProfilePage';
import PageWTabs from './Components/Pages/AccountTabs/PageWTabs';

import QuestionnaireDetails from './Components/Pages/QACards/QuestionnaireDetails';
import AnnouncementDetails from './Components/Pages/QACards/AnnouncementDetails';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<NonAuthMainPage />} />
                <Route path="/identification" element={<IdentificationPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegistrationPage />} />
                <Route path="/main" element={<MainPage />} />
                <Route path="/personal-information" element={<ProfilePage />} />
                <Route path="/phone-enter" element={<PhoneNumberEnteringPage />} />
                <Route path="/passcode-enter" element={<EnterCodePage />} />
                <Route path="/password-reset" element={<PasswordResetPage />} />
                <Route path="/account-actions" element={<PageWTabs />} />

                <Route path="/questionnaire/:id" element={<QuestionnaireDetails />} />
                <Route path="/announcement/:id" element={<AnnouncementDetails />} />

            </Routes>
        </Router>
    );
};

export default App;
