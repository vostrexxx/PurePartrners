import React, { useState, useEffect } from 'react';

// Компонент для отображения поля формы
const FormField = ({ type, label, name, placeholder, value, onChange, disabled, hidden }) => {
    if (hidden) return null;
    return (
        <div>
            <label>{label}</label>
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
            />
        </div>
    );
};

const FormPage = () => {
    const [formData, setFormData] = useState({
        categoriesOfWork: '',
        hasTeam: false,  // Начальное значение — булево
        team: '',
        hasEdu: false,   // Начальное значение — булево
        eduEst: '',
        eduDateStart: '',
        eduDateEnd: '',
        workExp: '',
        selfInfo: '',
        prices: ''
    });

    const [isEditable, setIsEditable] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const authToken = getAuthToken();
            if (!authToken) {
                console.error('Токен не найден');
                setIsDataLoaded(true);
                return;
            }

            try {
                const response = await fetch('http://localhost:8887/contractor', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Ошибка сети');
                }

                const data = await response.json();

                if (data.success === 0) {
                    console.log('Ответ success: 0, устанавливаем значения по умолчанию');
                    setFormData({
                        categoriesOfWork: '',
                        hasTeam: false,  // Булевое значение
                        team: '',
                        hasEdu: false,   // Булевое значение
                        eduEst: '',
                        eduDateStart: '',
                        eduDateEnd: '',
                        workExp: '',
                        selfInfo: '',
                        prices: ''
                    });
                } else {
                    setFormData(data.contractor);  // Записываем данные как они приходят
                }
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            } finally {
                setIsDataLoaded(true);
            }
        };

        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,  // Для чекбоксов используем булевые значения
        }));
    };

    const handleEdit = () => {
        setIsEditable(true);
    };

    const handleSubmitProfile = async (e) => {
        e.preventDefault();

        try {
            const authToken = getAuthToken();
            if (!authToken) {
                alert('Токен не найден');
                return;
            }

            const response = await fetch('http://localhost:8887/contractor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(formData)  // Отправляем данные в том виде, как они есть
            });

            if (response.ok) {
                alert('Профиль успешно обновлен!');
                setIsEditable(false);
            } else {
                alert('Ошибка при обновлении профиля.');
            }
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
            alert('Произошла ошибка. Попробуйте снова.');
        }
    };

    if (!isDataLoaded) {
        return <div>Ждём-ссс...</div>;
    }

    return (
        <div>
            <h1>Анкета</h1>
            <FormField
                type="text"
                label="Категория работ"
                name="categoriesOfWork"
                placeholder="Ваши категории работы"
                value={formData.categoriesOfWork}
                onChange={handleInputChange}
                disabled={!isEditable}
            />

            <div>
                <label>
                    Есть ли у вас команда?
                    <input
                        type="checkbox"
                        name="hasTeam"
                        checked={formData.hasTeam}  // Булевое значение
                        onChange={handleInputChange}
                        disabled={!isEditable}
                    />
                </label>
            </div>

            <FormField
                type="text"
                label="Информация по команде"
                name="team"
                placeholder="Информация о вашей команде"
                value={formData.team}
                onChange={handleInputChange}
                disabled={!isEditable}
                hidden={!formData.hasTeam}  // Булево значение
            />

            <div>
                <label>
                    Есть ли образование?
                    <input
                        type="checkbox"
                        name="hasEdu"
                        checked={formData.hasEdu}  // Булевое значение
                        onChange={handleInputChange}
                        disabled={!isEditable}
                    />
                </label>
            </div>
            <FormField
                type="text"
                label="Ваше учебное заведение"
                name="eduEst"
                placeholder="РТУ"
                value={formData.eduEst}
                onChange={handleInputChange}
                disabled={!isEditable}
                hidden={!formData.hasEdu}  // Булево значение
            />
            <FormField
                type="text"
                label="Дата начала обучения"
                name="eduDateStart"
                placeholder="2009"
                value={formData.eduDateStart}
                onChange={handleInputChange}
                disabled={!isEditable}
                hidden={!formData.hasEdu}  // Булево значение
            />
            <FormField
                type="text"
                label="Дата окончания обучения"
                name="eduDateEnd"
                placeholder="2013"
                value={formData.eduDateEnd}
                onChange={handleInputChange}
                disabled={!isEditable}
                hidden={!formData.hasEdu}  // Булево значение
            />
            <FormField
                type="text"
                label="Ваш рабочий опыт"
                name="workExp"
                placeholder="14 лет"
                value={formData.workExp}
                onChange={handleInputChange}
                disabled={!isEditable}
            />
            <FormField
                type="text"
                label="Ваша информация о себе"
                name="selfInfo"
                placeholder="Я такой-то такой-то"
                value={formData.selfInfo}
                onChange={handleInputChange}
                disabled={!isEditable}
            />
            <FormField
                type="text"
                label="Ваши расценки на услуги"
                name="prices"
                placeholder="Ваши расценки"
                value={formData.prices}
                onChange={handleInputChange}
                disabled={!isEditable}
            />
            <button onClick={handleEdit}>Редактировать</button>
            {isEditable && (
                <button onClick={handleSubmitProfile}>Сохранить</button>
            )}
        </div>
    );
};

// Функция для получения токена (пример)
const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

export default FormPage;
