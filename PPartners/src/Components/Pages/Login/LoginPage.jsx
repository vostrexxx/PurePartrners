import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

const LoginPage = () => {
    const location = useLocation();
    const [phoneNumber, setPhoneNumber] = useState(location.state?.phoneNumber || '');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = () => {
        // логика обработки входа пользователя
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
