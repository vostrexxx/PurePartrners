import React from 'react';

const ErrorMessage = ({ message, errorCode }) => {
    let displayMessage;

    if (errorCode === 503) {
        displayMessage = 'Сервис временно недоступен. Пожалуйста, попробуйте позже.';
    } else if (errorCode === 403 || errorCode === 401) {
        displayMessage = `Неверный пароль`;
    } else if (!errorCode) {
        displayMessage = message; 
    }
    else {
        displayMessage = 'Ошибка, попробуйте позже!'
    }

    if (!displayMessage) {
        return null;
    }

    return (
        <p style={{ color: 'red', marginTop: '5px', fontSize: '14px' }}>
            {displayMessage}
        </p>
    );
};

export default ErrorMessage;
