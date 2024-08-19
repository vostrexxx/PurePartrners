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

    // Загрузка данных профиля при монтировании компонента
    useEffect(() => {
        const loadProfileData = async () => {
            try {
                const token = localStorage.getItem('authToken'); // Предполагаем, что токен хранится в localStorage
                const response = await fetch('http://localhost:8887/profile', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': Bearer ${token}, // Добавляем токен в заголовок
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success === 1) {
                        setProfileData(data.profile);
                    } else {
                        console.log('Получен ответ success = 0, данные профиля не будут обновлены');
                    }
                } else {
                    console.error('Ошибка загрузки данных профиля');
                }
            } catch (error) {
                console.error('Произошла ошибка при загрузке данных профиля:', error);
            }
        };

        loadProfileData();
    }, []); // Пустой массив зависимостей означает, что эффект выполнится один раз после монтирования компонента

    // Обработка изменений в полях ввода
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Сохранение данных профиля на сервере
    const handleSubmitProfile = async () => {
        try {
            const token = localStorage.getItem('authToken'); // Предполагаем, что токен хранится в localStorage
            const response = await fetch('http://localhost:8887/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': Bearer ${token}, // Добавляем токен в заголовок
                },
                body: JSON.stringify(profileData),
            });

            if (response.ok) {
                console.log('Данные профиля успешно сохранены');
            } else {
                console.error('Ошибка при сохранении данных профиля');
            }
        } catch (error) {
            console.error('Произошла ошибка при сохранении данных профиля:', error);
        }
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
                <input type="text" name="phoneNumber" value={profileData.phoneNumber} onChange={handleInputChange} /></div>
            <div>
                <label>Дата рождения:</label>
                <input type="date" name="birthdate" value={profileData.birthdate} onChange={handleInputChange} />
            </div>
            <button onClick={handleSubmitProfile}>Сохранить</button>
        </div>
    );
};

export default PersonalInformation;