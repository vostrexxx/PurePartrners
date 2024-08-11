import React, { useState } from 'react';
export const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

const MainPage = () => {
    const [activeSection, setActiveSection] = useState('profile');
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        birthDate: '',
        passportConfirmed: false,
    });

    const token = getAuthToken();
    console.log(token);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setProfileData((prevData) => ({
            ...prevData,
            [name]: checked,
        }));
    };

    const handleSubmitProfile = async () => {
        try {
            const response = await fetch('http://localhost:8887/profile/getData', {
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
            } else {
                alert('Ошибка при обновлении профиля.');
            }
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
            alert('Произошла ошибка. Попробуйте снова.');
        }
    };

    const Profile = () => (
        <div>
            <h2>Личные данные</h2>
            <div>
                <label>Имя:</label>
                <input
                    type="text"
                    name="firstName"
                    placeholder="Введите имя"
                    value={profileData.firstName}
                    onChange={handleInputChange}
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
                />
            </div>
            <div>
                <label>Емэил:</label>
                <input
                    type="email"
                    name="email"
                    placeholder="Введите емэил"
                    value={profileData.email}
                    onChange={handleInputChange}
                />
            </div>
            <div>
                <label>Дата рождения:</label>
                <input
                    type="date"
                    name="birthDate"
                    value={profileData.birthDate}
                    onChange={handleInputChange}
                />
            </div>
            <div>
                <label>Паспорт подтвержден:</label>
                <input
                    type="checkbox"
                    name="passportConfirmed"
                    checked={profileData.passportConfirmed}
                    onChange={handleCheckboxChange}
                />
            </div>
            <button onClick={handleSubmitProfile}>Сохранить изменения</button>
        </div>
    );

    const PassportVerification = () => (
        <div>
            <h2>Подтверждение паспорта</h2>
            <div>
                <label>Загрузить фото паспорта:</label>
                <input type="file" />
            </div>
        </div>
    );

    const ProfileActions = () => (
        <div>
            <h2>Действия с профилем</h2>
            <button onClick={() => alert('Выход из профиля')}>Выйти из профиля</button>
            <button onClick={() => alert('Профиль удален')}>Удалить профиль</button>
        </div>
    );

    const ProfileManagement = () => (
        <div>
            <h2>Работа с профилями</h2>
            {/* Здесь закидываем функционал для управления профилями */}
        </div>
    );

    const renderSection = () => {
        switch (activeSection) {
            case 'profile':
                return <Profile />;
            case 'passport':
                return <PassportVerification />;
            case 'actions':
                return <ProfileActions />;
            case 'management':
                return <ProfileManagement />;
            default:
                return <Profile />;
        }
    };

    return (
        <div>
            <h1>Главная страница</h1>
            <nav>
                <button onClick={() => setActiveSection('profile')}>Профиль</button>
                <button onClick={() => setActiveSection('passport')}>Подтверждение паспорта</button>
                <button onClick={() => setActiveSection('actions')}>Действия с профилем</button>
                <button onClick={() => setActiveSection('management')}>Работа с профилями</button>
            </nav>
            <div>
                {renderSection()}
            </div>
        </div>
    );
};

export default MainPage;
