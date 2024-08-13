import React, { useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PhoneNumberEnteringPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('phoneNumber'));

    const handleEnterPhoneNumber = async () => {

        const simulateResponse = () => 1;
        if (simulateResponse() === 1) {
            navigate('/PasscodeEnter');
        } else {
            console.error('Ошибка входа');
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