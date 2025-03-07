import React, { createContext, useContext, useState } from 'react';
import ToastNotification from './ToastNotification';
const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('info');

    const showNotification = (message, type = 'info') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    return (
        <ToastContext.Provider value={showNotification}>
            {children}
            <ToastNotification
                message={toastMessage}
                type={toastType}
                show={showToast}
                onClose={() => setShowToast(false)}
            />
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);