import React, { useState, useEffect } from 'react';

// Функция для получения токена
const getAuthToken = () => localStorage.getItem('authToken');

const MainPage = () => {
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        birthDate: '',
        passportConfirmed: false,
    });
    const [token, setToken] = useState('');
    const [isEditable, setIsEditable] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // Получаем токен и загружаем данные профиля при монтировании компонента
    useEffect(() => {
        const authToken = getAuthToken();
        setToken(authToken);

        // Выполняем GET запрос для загрузки данных профиля
        fetch('http://localhost:8887/profile/getData', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
        })
            .then(response => response.json())
            .then(data => {
                if (data.success === 1) {
                    setProfileData(data.profile);
                    setIsEditable(false); // поля изначально не редактируемы
                } else {
                    setIsEditable(true); // если данных нет, пользователь может вводить информацию
                }
                setIsDataLoaded(true); // Устанавливаем флаг, что данные загружены
            })
            .catch(error => {
                console.error('Ошибка при загрузке данных:', error);
            });
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setProfileData(prevData => ({
            ...prevData,
            [name]: checked
        }));
    };

    const handleEdit = () => {
        setIsEditable(true); // Позволяем редактировать поля
    };

    const handleSubmitProfile = async () => {
        try {
            const response = await fetch('http://localhost:8887/profile/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (data.success) {
                alert('Профиль успешно обновлен!');
                setProfileData(data.profile); // Обновляем данные профиля
                setIsEditable(false); // Поля снова становятся не редактируемыми
            } else {
                alert('Ошибка при обновлении профиля.');
            }
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
            alert('Произошла ошибка. Попробуйте снова.');
        }
    };

    if (!isDataLoaded) {
        return <div>Ждёмссс...</div>; // Пока данные загружаются, показываем загрузку
    }

    return (
        <div>
            <h1>Личные данные</h1>
            <div>
                <label>Имя:</label>
                <input
                    type="text"
                    name="firstName"
                    placeholder="Введите имя"
                    value={profileData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditable} // Поля редактируемы только в режиме редактирования
                />
            </div>
            <div>
                <label>Фамилия:</label>
                <input
                    type="text"
                    name="lastName"
                    placeholder="Введите фамилию"
                    value={profileData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                />
            </div>
            <div>
                <label>Отчество:</label>
                <input
                    type="text"
                    name="middleName"
                    placeholder="Введите отчество"
                    value={profileData.middleName}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                />
            </div>
            <div>
                <label>Почта:</label>
                <input
                    type="email"
                    name="email"
                    placeholder="Введите емэил"
                    value={profileData.email}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                />
            </div>
            <div>
                <label>Дата рождения:</label>
                <input
                    type="date"
                    name="birthDate"
                    value={profileData.birthDate}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                />
            </div>
            <div>
                <label>Паспорт подтвержден:</label>
                <input
                    type="checkbox"
                    name="passportConfirmed"
                    checked={profileData.passportConfirmed}
                    onChange={handleCheckboxChange}
                    disabled={!isEditable}
                />
            </div>
            {isEditable ? (
                <button onClick={handleSubmitProfile}>Сохранить изменения</button>
            ) : (
                <button onClick={handleEdit}>Изменить данные</button>
            )}
        </div>
    );
};

export default MainPage;
