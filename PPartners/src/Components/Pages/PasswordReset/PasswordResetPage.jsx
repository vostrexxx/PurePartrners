import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PasswordResetPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const handlePasswordReset = async () => {
        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }
        const simulateResponse = () => 1;
        if (simulateResponse() === 1) {
            navigate('/login');
        } else {
            console.error('Ошибка входа');
        }
    };

    return (
        <div>
            <label>Введите новый пароль:</label>
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
            
            <button onClick={handlePasswordReset}>
                Сохранить
            </button>
        </div>
    );
};

export default PasswordResetPage;