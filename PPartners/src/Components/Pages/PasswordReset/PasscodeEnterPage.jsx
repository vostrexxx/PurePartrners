import React, { useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PhoneNumberEnteringPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [passcode, setPasscode] = useState('');

    const ChangePhoneNumber = async () => {
  
        const simulateResponse = () => 1;
        if (simulateResponse() === 1) {
            navigate('/PhoneEnter');
        } else {
            console.error('Ошибка входа');
        }
        
    };

    const PasscodeEnter = async () => {
        const simulateResponse = () => 1;
        if (simulateResponse() === 1) {
            navigate('/PasswordReset');
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

