import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ErrorMessage from '../../ErrorHandling/ErrorMessage';

const LoginPage = () => {
    const [errorMessage, setErrorMessage] = useState(null);
    const [errorCode, setErrorCode] = useState(null);
    
    const location = useLocation();
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('phoneNumber'));
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    let url = localStorage.getItem('url')

    const ChangePhoneNumber = async () => {
  
        // const simulateResponse = () => 1;
        // if (simulateResponse() === 1) {
            navigate('/identification');
        // } else {
        //     console.error('Ошибка входа');
        // }
        
    };
    const handleLogin = async () => {
        try {
            const response = await fetch(url + '/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phoneNumber, password }),
            });
    
            if (response.ok) {
                setErrorMessage(null);
                setErrorCode(null);
                const data = await response.json();
                const token = data.token;
                
                localStorage.setItem('authToken', token);
                
                navigate('/main');
            } else {
                setErrorMessage(response.message)
                setErrorCode(response.status)

            }
        } catch (error) {
            setErrorMessage(error.message)
            setErrorCode(null)
        }
    };

    const handlePasswordReset = async () => {
        // const simulateResponse = () => 1;
        // if (simulateResponse() === 1) {
            navigate('/phone-enter');
        // } else {
        //     console.error('Ошибка входа');
        // }
    };

    return (
        <div>
            <label>Ваш номер телефона:</label>
            <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                disabled
            />
            <label>Введите пароль:</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <label>
                <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                />
                Запомнить меня
            </label>
            <button onClick={handleLogin}>Войти</button>
            <button onClick={handlePasswordReset}>Забыли пароль?</button>
            <button onClick={ChangePhoneNumber}>
                Изменить номер телефона
            </button>
            <ErrorMessage message={errorMessage} errorCode={errorCode} />

        </div>
    );
};

export default LoginPage;
