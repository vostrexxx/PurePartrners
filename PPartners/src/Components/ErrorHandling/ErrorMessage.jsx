import React from 'react';

const ErrorMessage = ({ message }) => {
    if (!message) return null;

    return (
        <div style={{ color: 'red', marginTop: '10px' }}>
            Ошибка: {message}
        </div>
    );
};

export default ErrorMessage;