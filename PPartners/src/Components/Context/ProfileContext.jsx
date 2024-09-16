import React, { createContext, useContext, useState, useEffect } from 'react';

// Создание контекста
const ProfileContext = createContext();

// Провайдер профиля
export const ProfileProvider = ({ children }) => {
    const [isSpecialist, setIsSpecialist] = useState(() => {
        // Проверка состояния профиля в localStorage при загрузке страницы
        return localStorage.getItem('activeProfile') === 'specialist';
    });

    // Обработчик переключения профиля
    const toggleProfile = () => {
        const newProfile = isSpecialist ? 'customer' : 'specialist';
        setIsSpecialist(!isSpecialist);
        localStorage.setItem('activeProfile', newProfile); // Сохраняем в localStorage
    };

    return (
        <ProfileContext.Provider value={{ isSpecialist, toggleProfile }}>
            {children}
        </ProfileContext.Provider>
    );
};

// Хук для доступа к контексту профиля
export const useProfile = () => useContext(ProfileContext);
