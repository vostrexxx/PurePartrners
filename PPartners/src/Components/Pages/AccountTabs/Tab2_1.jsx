import React, { useState, useEffect } from 'react';
//  На второй странице отображаются только те поля, которые должен заполнить Спец именно по Анкете
// Компонент для отображения поля формы
const FormField = ({ type, label, name, placeholder, value, onChange, disabled }) => (
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

const FormPage = () => {
    const [formData, setFormData] = useState({
        categoriesOfWork: '', // Категория работ, РЕД
        // name: '', // Имя берём с ПИ 
        // surname: '', // Фам берём с ПИ
        // photo: '', // Фото берём с ПИ
        // reviews: '', // Отзывы берём с ОС
        // completedProjects: '', // Выполненые объекты берём с ОС
        // rating: '', // Оценку берём с ОС
        hasTeam: '', // Редактируемая информация, значение поля true/false, если есть команда, то выводим информацию из переменной team, иначе ничего РЕД
        team: '', // Информация по команде РЕД 
        hasEdu: '', // Образование, булевое поле, если true, то выводим поля с eduEst & eduDates, РЕД
        eduEst: '', // Учебное заведение РЕД
        eduDateStart: '', // Дата начала образования РЕД
        eduDateEnd: '', // Дата окончания образования РЕД
        workExp: '', // Опыт в сфере строительства РЕД
        // regDate: '', // Дата регистрации РЕД
        selfInfo: '', // Информация о себе РЕД
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
                                    // name: 'Никита',
                                    // surname: 'Востриков',
                                    // photo: '',
                                    // reviews: 'Азизбек пунктуален, работу выполняет на совесть...',
                                    // completedProjects: 'Построен дом',
                                    // rating: '5.0',
                                    hasTeam: 'Да',
                                    team: 'Команда строителей',
                                    hasEdu: 'Да',
                                    eduEst: 'РГСУ',
                                    eduDateStart: '2009',
                                    eduDateEnd: '2013',
                                    workExp: '6 лет',
                                    // regDate: 'На сервисе с 02.2024 (80 дней)',
                                    selfInfo: 'Работаю с 2013 года...',
                                },
                            }),
                        100
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
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
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
            );if (response.success) {
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
            {/* <FormField // Пока просто текстовое поле, потом продумать, как лучше это реализовать
                type="text"
                label="Категория работ"
                name="categoriesOfWork"
                placeholder="Категория работ"
                value={formData.categoriesOfWork}
                onChange={handleInputChange}
                disabled={!isEditable}
            />
            <FormField
                type="text"
                label="ИФ"
                name="NameSurname"
                placeholder="Ваше имя и фамилия"
                value={formData.name + " " + formData.surname}
                onChange={handleInputChange}
                disabled={true}
            />
            <FormField // Сменить тип данных под фото
                type="text"
                label="Фото"
                name="photo"
                placeholder="Ваша фотография"
                value={formData.photo}
                onChange={handleInputChange}
                disabled={!isEditable}
            /> */}
            {/* <FormField // Пока текстовое, потом надо будет продумать блоки с отзывами (кто написал + дата отзыва + сам отзыв)
                type="text" 
                label="Отзывы"
                name="reviews"
                placeholder="Ваши отзывы"
                value={formData.reviews}
                onChange={handleInputChange}
                disabled={true}
            />
            <FormField
                type="text"
                label="Завершенные проекты"
                name="completedProjects"
                placeholder="Ваши законченные проекты"
                value={formData.completedProjects}
                onChange={handleInputChange}
                disabled={true}
            />
            <FormField
                type="text"
                label="Оценка на сервисе"
                name="rating"
                placeholder="Ваша оценка на сервисе"
                value={formData.rating}
                onChange={handleInputChange}
                disabled={true}
            /> */}
            <FormField
                type="text"
                label="Есть ли команда?"
                name="hasTeam"
                placeholder="Да/Нет"
                value={formData.hasTeam}
                onChange={handleInputChange}
                disabled={!isEditable}
            />
            <FormField
                type="text"
                label="Информация по команде"
                name="team"
                placeholder="Информация о вашей команде"
                value={formData.team}
                onChange={handleInputChange}
                disabled={!isEditable}
            />
            <FormField
                type="text"
                label="Есть ли образование?"
                name="hasEdu"
                placeholder="Да/Нет"
                value={formData.hasEdu}
                onChange={handleInputChange}
                disabled={!isEditable}
            />
            <FormField
                type="text"
                label="Ваше учебное заведение"
                name="eduEst"
                placeholder="РТУ МЕМРА"
                value={formData.eduEst}
                onChange={handleInputChange}
                disabled={!isEditable}
            />
            <FormField
                type="text"
                label="Даты начала обучения"
                name="eduEst"
                placeholder="2009"
                value={formData.eduDateStart}
                onChange={handleInputChange}
                disabled={!isEditable}
            />
            <FormField
                type="text"
                label="Даты окончания обучения"
                name="eduEst"
                placeholder="2013"
                value={formData.eduDateEnd}
                onChange={handleInputChange}
                disabled={!isEditable}
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
            {/* <FormField
                type="text"
                label="Ваша дата регистрации"
                name="regDate"
                placeholder="21 01 2009"
                value={formData.regDate}
                onChange={handleInputChange}
                disabled={true}
            /> */}
            <FormField
                type="text"
                label="Ваша информация о себе"
                name="selfInfo"
                placeholder="Я такой-то такой-то"
                value={formData.selfInfo}
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