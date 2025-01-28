import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ProfileProvider } from './Components/Context/ProfileContext.jsx';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker успешно зарегистрирован:', registration.scope);
    })
    .catch((error) => {
      console.error('Ошибка регистрации Service Worker:', error);
    });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ProfileProvider>
    <App />
  </ProfileProvider>
);
