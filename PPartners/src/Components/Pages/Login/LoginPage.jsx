import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('phoneNumber'));
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const ChangePhoneNumber = async () => {
  
        const simulateResponse = () => 1;
        if (simulateResponse() === 1) {
            navigate('/');
        } else {
            console.error('Ошибка входа');
        }
        
    };
    const handleLogin = async () => {
        // try {
        //     const response = await fetch('http://localhost:8887/auth/login', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({ phoneNumber, password }),
        //     });
    
        //     if (response.ok) {
        //         const data = await response.json();
        //         const token = data.token; // Сервер возвращает токен в поле `token`
                
        //         localStorage.setItem('authToken', token);
                
        //         navigate('/main');
        //     } else {
        //         console.error('Ошибка входа');
        //     }
        // } catch (error) {
        //     console.error('Произошла ошибка:', error);
        // }

        const simulateResponse = () => 1;
        if (simulateResponse() === 1) {
            navigate('/main');
        } else {
            console.error('Ошибка входа');
        }
    };

    const handlePasswordReset = async () => {

        const simulateResponse = () => 1;
        if (simulateResponse() === 1) {
            navigate('/PhoneEnter');
        } else {
            console.error('Ошибка входа');
        }
        
    };

    return (
        <div>
            <label>Ваш номер телефона:</label>
            <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+71234567890"
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
        </div>
    );
};

export default LoginPage;
