import React, { useState } from 'react';
import { useProfile } from '../../Context/ProfileContext'; // Импорт профиля

// Компонент формы для анкеты (Специалист)
const QuestionnaireForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        categoriesOfWork: '',
        workExperience: '',
        prices: '',
        // Добавь другие поля для анкеты
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData); // Отправка данных формы
    };

    return (
        <div>
            <h3>Создать анкету (Специалист)</h3>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="categoriesOfWork"
                    placeholder="Категории работ"
                    value={formData.categoriesOfWork}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="workExperience"
                    placeholder="Опыт работы"
                    value={formData.workExperience}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="prices"
                    placeholder="Цены на услуги"
                    value={formData.prices}
                    onChange={handleInputChange}
                />
                <button type="submit">Сохранить анкету</button>
                <button type="button" onClick={onCancel}>Отмена</button>
            </form>
        </div>
    );
};

// Компонент формы для объявления (Заказчик)
const AnnouncementForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget: '',
        // Добавь другие поля для объявления
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData); // Отправка данных формы
    };

    return (
        <div>
            <h3>Создать объявление (Заказчик)</h3>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="title"
                    placeholder="Заголовок"
                    value={formData.title}
                    onChange={handleInputChange}
                />
                <textarea
                    name="description"
                    placeholder="Описание"
                    value={formData.description}
                    onChange={handleInputChange}
                />
                <input
                    type="number"
                    name="budget"
                    placeholder="Бюджет"
                    value={formData.budget}
                    onChange={handleInputChange}
                />
                {/* Добавь другие поля */}
                <button type="submit">Сохранить объявление</button>
                <button type="button" onClick={onCancel}>Отмена</button>
            </form>
        </div>
    );
};

// Основной компонент
const MainPage = () => {
    const { isSpecialist } = useProfile(); // Получаем профиль
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateClick = () => {
        setIsCreating(true); // Отображаем форму
    };

    const handleFormSubmit = (formData) => {
        console.log('Данные формы:', formData);
        // Здесь можно отправить данные на сервер
        setIsCreating(false); // Скрываем форму после отправки
    };

    const handleCancel = () => {
        setIsCreating(false); // Отмена создания
    };

    return (
        <div>
            {!isCreating ? (
                <button onClick={handleCreateClick}>
                    {isSpecialist ? 'Создать анкету' : 'Создать объявление'}
                </button>
            ) : (
                isSpecialist ? (
                    <QuestionnaireForm onSubmit={handleFormSubmit} onCancel={handleCancel} />
                ) : (
                    <AnnouncementForm onSubmit={handleFormSubmit} onCancel={handleCancel} />
                )
            )}
        </div>
    );
};

export default MainPage;
