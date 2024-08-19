import React, { useState, useEffect } from 'react';

// Функция для получения токена
const getAuthToken = () => localStorage.getItem('authToken');

const MainPage = () => {
    const [profileData, setProfileData] = useState({
        name: '',
        surname: '',
        patronymic: '',
        email: '',
        phoneNumber: '',
        birthday: '',
        isPassportConfirmed: false,
    });
    const [token, setToken] = useState('');
    const [isEditable, setIsEditable] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [isUserRegistered, setIsUserRegistered] = useState(true); // Флаг для проверки, зарегистрирован ли пользователь

    // Получаем токен и загружаем данные профиля при монтировании компонента
    useEffect(() => {
        const authToken = getAuthToken();
        if (authToken) {
            setToken(authToken);
            
            // Выполняем GET запрос для загрузки данных профиля только если данные еще не загружены
            if (!isDataLoaded) {
                fetch('http://localhost:8887/profile', {
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
                        setIsEditable(false); // Поля изначально не редактируемы
                    } else {
                        setIsUserRegistered(false); // Если профиль не найден, отмечаем, что пользователь не зарегистрирован
                    }
                    setIsDataLoaded(true); // Устанавливаем флаг, что данные загружены
                })
                .catch(error => {
                    console.error('Ошибка при загрузке данных:', error);
                    setIsDataLoaded(true); // Устанавливаем флаг, чтобы показать ошибку или форму регистрации
                });
            }
        } else {
            setIsUserRegistered(false); // Если токена нет, показываем форму регистрации
            setIsDataLoaded(true); // Данные не нужны, так как это форма регистрации
        }
    }, [isDataLoaded]); // Зависимость от isDataLoaded, чтобы избежать повторных запросов

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
            const response = await fetch('http://localhost:8887/profile', {
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
        return <div>Ждём-ссс...</div>; // Пока данные загружаются, показываем загрузку
    }

    if (!isUserRegistered) {
        return (
            <div>
                <h1>Личные данные</h1>
                <div>
                    <label>Имя:</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Введите имя"
                        value={profileData.name}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label>Фамилия:</label>
                    <input
                        type="text"
                        name="surname"
                        placeholder="Введите фамилию"
                        value={profileData.surname}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label>Отчество:</label>
                    <input
                        type="text"
                        name="patronymic"
                        placeholder="Введите отчество"
                        value={profileData.patronymic}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label>Почта:</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Введите почту"
                        value={profileData.email}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label>Номер телефона:</label>
                    <input
                        type="text"
                        name="phoneNumber"
                        placeholder="Введите номер телефона"
                        value={profileData.phoneNumber}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <label>Дата рождения:</label>
                    <input
                        type="date"
                        name="birthDay"
                        value={profileData.birthday}
                        onChange={handleInputChange}
                    />
                </div>
                <button onClick={handleSubmitProfile}>Сохранить</button>
            </div>
        );
    }
};

export default MainPage;
