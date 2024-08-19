import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PhoneNumberEnteringPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('phoneNumber') || '');

    const handleEnterPhoneNumber = async () => {
        try {
            const response = await fetch('HolyG', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phoneNumber }),
            });

            if (response.ok) {
                // Симулируем ответ, если нужно
                const simulateResponse = () => 1;
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
    };

    return (
        <div>
            <label>Ваш номер телефона:</label>
            <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+71234567890"
            />
            <button onClick={handleEnterPhoneNumber}>
                Подтвердить
            </button>
        </div>
    );
};

export default PhoneNumberEnteringPage;