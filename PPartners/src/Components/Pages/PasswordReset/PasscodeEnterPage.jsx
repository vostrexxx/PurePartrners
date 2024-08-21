import React, { useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PhoneNumberEnteringPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [passcode, setPasscode] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('phoneNumber') || '');

    const ChangePhoneNumber = async () => {
  
        const simulateResponse = () => 1;
        if (simulateResponse() === 1) {
            navigate('/phone-enter');
        } else {
            console.error('Ошибка входа');
        }
        
    };

    const PasscodeEnter = async () => {
        try {
            const response = await fetch('http://localhost:8887/change/code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phoneNumber, passcode }),
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
            navigate('/password-reset');
        } else {
            console.error('Ошибка входа');
        }
        
    };


    return (
        <div>
            <label>Введите код из СМС:</label>
            <input
                type="passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="000000"
            />
            <button onClick={PasscodeEnter}>
                Подтвердить
            </button>
            <button onClick={ChangePhoneNumber}>
                Изменить номер телефона
            </button>
        </div>
    );
};

export default PhoneNumberEnteringPage;

