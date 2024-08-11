import React, { useState } from 'react';
export const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

const MainPage = () => {
    const [activeSection, setActiveSection] = useState('profile');
    
    const token = getAuthToken();
    console.log(token);
    
    const Profile = () => (
        <div>
            <h2>Личные данные</h2>
            <div>
                <label>Имя:</label>
                <input type="text" placeholder="Введите имя" />
            </div>
            <div>
                <label>Фамилия:</label>
                <input type="text" placeholder="Введите фамилию" />
            </div>
            <div>
                <label>Отчество:</label>
                <input type="text" placeholder="Введите отчество" />
            </div>
            <div>
                <label>Номер телефона:</label>
                <input type="text" placeholder="+79164331768" disabled />
            </div>
            <div>
                <label>Емэил:</label>
                <input type="email" placeholder="Введите емэил" />
            </div>
            <div>
                <label>Дата рождения:</label>
                <input type="date" />
            </div>
            <div>
                <label>Паспорт подтвержден:</label>
                <input type="checkbox" />
            </div>
            <div>
                <label>Дата регистрации:</label>
                <input type="text" disabled />
            </div>
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
            {/* Здесь можно добавить функционал для управления профилями */}
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
