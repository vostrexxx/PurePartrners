import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const IdentificationPage = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isValid, setIsValid] = useState(true);
    const navigate = useNavigate();
    localStorage.setItem('phoneNumber', phoneNumber);
    const handleInputChange = (e) => {
        const value = e.target.value;
        setPhoneNumber(value);
        const isValidPhone = /^\+(?:[0-9] ?){6,14}[0-9]$/.test(value);
        setIsValid(isValidPhone);
    };

    // const handleSubmit = async () => {
    //     if (isValid) {
    //         try {
    //             const response = await fetch('http://localhost:8887/auth/checkPhoneNumber', {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify({ phoneNumber }),
    //             });

    //             const data = await response.json();

    //             if (data.success) {
    //                 navigate('/login', { state: { phoneNumber } });
    //             } else {
    //                 navigate('/register', { state: { phoneNumber } });
    //             }
    //         } catch (error) {
    //             console.error('Ошибка:', error);
    //         }
    //     } else {
    //         alert("Неверный формат номера телефона. Введите в формате: +79164331768");
    //     }
    // };

    const handleSubmit = async () => {
        if (isValid) {
            try {
                // заглушка для POST запроса))
                const mockResponse = await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({
                            json: () => Promise.resolve({ success: 1 }),
                        });
                    }, 1000);
                });
                const data = await mockResponse.json();
                console.log(data.success)

                if (data.success) {
                    navigate('/login');
                } else {
                    navigate('/register');
                }
            } catch (error) {
                console.error('Ошибка:', error);
            }
        } else {
            alert("Неверный формат номера телефона. Введите в формате: +79164331768");
        }
    };


    return (
        <div>
            <label>Введите номер телефона:</label>
            <input
                type="text"
                value={phoneNumber}
                onChange={handleInputChange}
                placeholder="+71234567890"
            />
            {!isValid && (
                <p style={{ color: 'red', marginTop: '5px' }}>
                    Неверный формат номера телефона.
                </p>
            )}
            <button onClick={handleSubmit}>Продолжить</button>
        </div>
    );
};

export default IdentificationPage;
