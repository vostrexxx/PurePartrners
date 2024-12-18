import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../../ErrorHandling/ErrorMessage';

const IdentificationPage = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isValid, setIsValid] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const [errorCode, setErrorCode] = useState(null);
    const navigate = useNavigate();

    localStorage.setItem('phoneNumber', phoneNumber);
    localStorage.setItem('url', 'http://192.168.1.12:8887');
    // localStorage.setItem('url', 'http://192.168.43.68:8887');
    // localStorage.setItem('url', 'http://192.168.110.68:8887');

    localStorage.setItem('authToken', null);
    const url = localStorage.getItem('url');

    const handleInputChange = (e) => {
        const value = e.target.value;
        setPhoneNumber(value);
        const isValidPhone = /^\+(?:[0-9] ?){6,14}[0-9]$/.test(value);
        setIsValid(isValidPhone);
        setErrorMessage(null); // Сбрасываем ошибку при вводе нового номера
        setErrorCode(null);
    };

    const handleSubmit = async () => {
        if (isValid) {
            try {
                const response = await fetch(url + '/auth/checkPhoneNumber', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ phoneNumber }),
                });

                if (!response.ok) {
                    setErrorCode(response.status);
                    // console.log(response.status)
                    return;
                }

                const data = await response.json();

                if (data.success === 1) {
                    navigate('/login', { state: { phoneNumber } });
                } else if (data.success === 0) {
                    navigate('/register', { state: { phoneNumber } });
                }
            } catch (error) {
                setErrorCode(null); // Сбрасываем код ошибки, если он не специфичный
                setErrorMessage('Произошла ошибка. Проверьте соединение с интернетом.');
                // console.error('Ошибка:', error);
            }
        } else {
            setErrorMessage('Неверный формат номера телефона. Введите в формате: +79164331768');
        }
    };

    return (
        <div>
            <label>Введите номер телефона:</label>
            <input
                type="text"
                value={phoneNumber}
                onChange={handleInputChange}
                placeholder="+1234567890"
            />
            {!isValid && (
                <p style={{ color: 'red', marginTop: '5px' }}>
                    Неверный формат номера телефона.
                </p>
            )}
            <ErrorMessage message={errorMessage} errorCode={errorCode} />
            <button onClick={handleSubmit}>Продолжить</button>
        </div>
    );
};

export default IdentificationPage;
 