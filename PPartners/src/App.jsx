import React, { useEffect } from 'react';
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
import AgreementPage from './Components/Pages/Agreement/AgreementPage';
import ChatPage from './Components/Pages/Chat/ChatPage';
import global from 'global';
import AllChatsPage from './Components/Pages/Chat/AllChatsPage';
import AC from './Components/Pages/AccountTabs/AutoCompleteInput';
// import BT from './Components/Pages/Chat/BuilderTest';
import EntityDetailes from './Components/Previews/EntityDetails'
import BalancePage from './Components/Pages/Balance/BalancePage';
// import { requestPermission } from '../firebase'; // Убедитесь, что путь правильный

global.global = global;
const App = () => {

  // useEffect(() => {
  //   const getFCMToken = async () => {
  //     const token = await requestPermission();
  //     if (token) {
  //       console.log('FCM токен получен и отправлен на сервер:', token);
  //     }
  //   };

  //   getFCMToken();
  // }, []);

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
        <Route path="/agreement" element={<AgreementPage />} />
        <Route path="/chat/:chatId" element={<ChatPage />} />
        <Route path="/all-chats" element={<AllChatsPage />} />
        <Route path="/entity/:id" element={< EntityDetailes />} />
        <Route path="/balance" element={< BalancePage />} />
      </Routes>
    </Router>
  );
};

export default App;
