import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
let url = localStorage.getItem('url')

const PhoneNumberEnteringPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('phoneNumber') || '');

    const handleEnterPhoneNumber = async () => {
        try {
            const response = await fetch(url + '/auth/password/code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phoneNumber }),
            });

            if (response.ok) {
                navigate('/passcode-enter');

                // Симулируем ответ, если нужно
                // const simulateResponse = () => 1;
                // if (simulateResponse() === 1) {
                //     navigate('/passcode-enter');
                // } else {
                //     console.error('Ошибка входа');
                // }
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
                placeholder="+1234567890"
            />
            <button onClick={handleEnterPhoneNumber}>
                Подтвердить
            </button>
        </div>
    );
};

export default PhoneNumberEnteringPage;