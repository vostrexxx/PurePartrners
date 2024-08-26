import React, { useState, useEffect } from 'react';

// Компонент для отображения поля формы
const FormField = ({ type, label, name, placeholder, value, onChange, disabled, hidden }) => {
    if (hidden) return null; // Если поле скрыто, ничего не рендерим
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
        categoriesOfWork: '', // Категория работ, РЕД
        hasTeam: '', // Редактируемая информация, значение поля true/false, если есть команда, то выводим информацию из переменной team, иначе ничего РЕД
        team: '', // Информация по команде РЕД 
        hasEdu: '', // Образование, булевое поле, если true, то выводим поля с eduEst & eduDates, РЕД
        eduEst: '', // Учебное заведение РЕД
        eduDateStart: '', // Дата начала образования РЕД
        eduDateEnd: '', // Дата окончания образования РЕД
        workExp: '', // Опыт в сфере строительства РЕД
        selfInfo: '', // Информация о себе РЕД
        prices: '' // Расценки на услуги
    });

    const [isEditable, setIsEditable] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    useEffect(() => {
        // Имитация загрузки данных
        const fetchData = async () => {
            try {
                const data = await new Promise((resolve) =>
                    setTimeout(
                        () =>
                            resolve({
                                profile: {
                                    categoriesOfWork: 'Строительство дома',
                                    hasTeam: 'Да',
                                    team: 'Команда строителей',
                                    hasEdu: 'Да',
                                    eduEst: 'РГСУ',
                                    eduDateStart: '2009',
                                    eduDateEnd: '2013',
                                    workExp: '6 лет',
                                    selfInfo: 'Работаю с 2013 года...',
                                    prices: 'Построить дом - 3000к рублей'
                                },
                            }),
                        1000
                    )
                );

                setFormData(data.profile);
                setIsDataLoaded(true);
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            }
        };

        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? (checked ? 'Да' : 'Нет') : value,
        }));
    };

    const handleEdit = () => {
        setIsEditable(true);
    };

    const handleSubmitProfile = async (e) => {
        e.preventDefault();
        try {
            // Пример отправки данных на сервер
            const response = await new Promise((resolve) =>
                setTimeout(() => resolve({ success: true }), 1000)
            );
            if (response.success) {
                alert('Профиль успешно обновлен!');
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
                // hidden={formData.hasTeam !== 'Да'}
            />

            <div>
                <label>
                Есть ли у вас команда?
                <input
                    type="checkbox"
                    name="hasTeam"
                    checked={formData.hasTeam === 'Да'}
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
                hidden={formData.hasTeam !== 'Да'}
            />

            <div>
                <label>
                    Есть ли образование?
                    <input
                        type="checkbox"
                        name="hasEdu"
                        checked={formData.hasEdu === 'Да'}
                        onChange={handleInputChange}
                        disabled={!isEditable}
                    />
                </label>
            </div>
            <FormField
                type="text"
                label="Ваше учебное заведение"
                name="eduEst"
                placeholder="РТУ МЕМРэА"
                value={formData.eduEst}
                onChange={handleInputChange}
                disabled={!isEditable}
                hidden={formData.hasEdu !== 'Да'}
            />
            <FormField
                type="text"
                label="Дата начала обучения"
                name="eduDateStart"
                placeholder="2009"
                value={formData.eduDateStart}
                onChange={handleInputChange}
                disabled={!isEditable}
                hidden={formData.hasEdu !== 'Да'}

            />
            <FormField
                type="text"
                label="Дата окончания обучения"
                name="eduDateEnd"
                placeholder="2013"
                value={formData.eduDateEnd}
                onChange={handleInputChange}
                disabled={!isEditable}
                hidden={formData.hasEdu !== 'Да'}

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
                placeholder="Выши расценки"
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

export default FormPage;
