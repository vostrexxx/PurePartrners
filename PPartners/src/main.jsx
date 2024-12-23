import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ProfileProvider } from './Components/Context/ProfileContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <ProfileProvider>
      <App />
    </ProfileProvider>
  // </React.StrictMode>
);
