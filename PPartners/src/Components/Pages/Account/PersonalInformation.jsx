import React, { useState, useEffect } from 'react';

const PersonalInformation = () => {
    const [profileData, setProfileData] = useState({
        name: '',
        surname: '',
        patronymic: '',
        email: '',
        phoneNumber: '',
        birthdate: '',
        isPassportConfirmed: false,
    });

    useEffect(() => {
        // Здесь должен быть код для загрузки данных профиля
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmitProfile = async () => {
        // Здесь должен быть код для сохранения данных профиля
    };

    return (
        <div>
            <h2>Личные данные</h2>
            <div>
                <label>Имя:</label>
                <input type="text" name="name" value={profileData.name} onChange={handleInputChange} />
            </div>
            <div>
                <label>Фамилия:</label>
                <input type="text" name="surname" value={profileData.surname} onChange={handleInputChange} />
            </div>
            <div>
                <label>Отчество:</label>
                <input type="text" name="patronymic" value={profileData.patronymic} onChange={handleInputChange} />
            </div>
            <div>
                <label>Почта:</label>
                <input type="email" name="email" value={profileData.email} onChange={handleInputChange} />
            </div>
            <div>
                <label>Номер телефона:</label>
                <input type="text" name="phoneNumber" value={profileData.phoneNumber} onChange={handleInputChange} />
            </div>
            <div>
                <label>Дата рождения:</label>
                <input type="date" name="birthdate" value={profileData.birthdate} onChange={handleInputChange} />
            </div>
            <button onClick={handleSubmitProfile}>Сохранить</button>
        </div>
    );
};

export default PersonalInformation;