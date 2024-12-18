import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
let url = localStorage.getItem('url')
import ErrorMessage from '../../ErrorHandling/ErrorMessage';

const RegistrationPage = () => {
    const [errorMessage, setErrorMessage] = useState(null);
    const [errorCode, setErrorCode] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('phoneNumber'));
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const ChangePhoneNumber = async () => {
            navigate('/identification');        
    };

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }

        try {
            const response = await fetch(url + '/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phoneNumber, password }),
            });

            if (!response.ok) {
                setErrorCode(response.status);
                setErrorMessage(response.message)
                return;
            } else {
                const data = await response.json();
                    navigate('/login', { state: { phoneNumber }} );
            }
        }
        catch (error) {
            setErrorCode(null);
            setErrorMessage(error);
        }
    };

    return (
        <div>
            <label>Ваш номер телефона:</label>
            <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+79164331768"
                disabled
            />
            <label>Введите пароль:</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <label>Подтвердите пароль:</label>
            <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button onClick={ChangePhoneNumber}>
                Изменить номер телефона
            </button>
            <button onClick={handleRegister}>Зарегистрироваться</button>
            <ErrorMessage message={errorMessage} errorCode={errorCode} />

        </div>
    );
};

export default RegistrationPage;
