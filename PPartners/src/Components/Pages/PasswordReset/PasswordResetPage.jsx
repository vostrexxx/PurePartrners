import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PasswordResetPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber] = useState(localStorage.getItem('phoneNumber') || '');

    
    const handlePasswordReset = async () => {
        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }
        try {
            const response = await fetch('http://localhost:8887/auth/password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phoneNumber, password }),
            });

            if (response.ok) {
                // Симулируем ответ, если нужно
                // const simulateResponse = () => 1;
                if (simulateResponse() === 1) {
                    navigate('/passcode-enter');
                } else {
                    console.error('Ошибка входа');
                }
            } else {
                console.error('Ошибка при отправке номера телефона');
            }
        } catch (error) {
            console.error('Произошла ошибка:', error);
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