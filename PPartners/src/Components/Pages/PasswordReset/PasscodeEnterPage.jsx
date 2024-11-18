import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

let url = localStorage.getItem('url');

const codeEnteringPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [code, setPasscode] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('phoneNumber') || '');
    const [error, setError] = useState(null); // Добавлено состояние для ошибки

    const ChangePhoneNumber = async () => {
        const simulateResponse = () => 1;
        if (simulateResponse() === 1) {
            navigate('/phone-enter');
        } else {
            console.error('Ошибка изменения номера');
        }
    };

    const PasscodeEnter = async () => {
        try {
            const response = await fetch(`${url}/auth/password/code/verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phoneNumber, code }),
            });

            if (response.ok) {
                setError(null); // Сбрасываем ошибку, если запрос успешен
                navigate('/password-reset');
            } else {
                setError('Неверный код или срок действия кода истёк. Попробуйте снова.'); // Устанавливаем сообщение об ошибке
            }
        } catch (error) {
            setError('Произошла ошибка при отправке данных.'); // Обрабатываем другие ошибки
            console.error('Произошла ошибка:', error);
        }
    };

    return (
        <div>
            <label>Введите код из СМС:</label>
            <input
                type="text"
                value={code}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="000000"
            />
            <button onClick={PasscodeEnter}>
                Подтвердить
            </button>
            <button onClick={ChangePhoneNumber}>
                Изменить номер телефона
            </button>
            
            {/* Вывод сообщения об ошибке */}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default codeEnteringPage;
