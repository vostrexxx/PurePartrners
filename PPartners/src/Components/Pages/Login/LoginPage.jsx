import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState(location.state?.phoneNumber || '');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

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

    return (
        <div>
            <label>Введите номер телефона:</label>
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
            <label>
                <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                />
                Запомнить меня
            </label>
            <button onClick={handleLogin}>Войти</button>
            <button>Забыли пароль?</button>
        </div>
    );
};

export default LoginPage;
