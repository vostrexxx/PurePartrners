import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
let url = localStorage.getItem('url')

const RegistrationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('phoneNumber'));
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const ChangePhoneNumber = async () => {
  
        const simulateResponse = () => 1;
        if (simulateResponse() === 1) {
            navigate('/identification');
        } else {
            console.error('Ошибка входа');
        }
        
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

            const data = await response.json();

            if (data.success) {
                navigate('/login', { state: { phoneNumber } });
            } else {
                alert('Ошибка регистрации. Попробуйте снова.');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка при отправке запроса. Попробуйте снова.');
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
        </div>
    );
};

export default RegistrationPage;
