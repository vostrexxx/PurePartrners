import React, { useState, useEffect } from 'react';

const getAuthToken = () => localStorage.getItem('authToken');

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
        categoriesOfWork: '',
        hasTeam: '',
        team: '',
        hasEdu: '',
        eduEst: '',
        eduDateStart: '',
        eduDateEnd: '',
        workExp: '',
        selfInfo: '',
        prices: '',
    });

    const [isEditable, setIsEditable] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [imageFile, setImageFile] = useState(null); // Хранение файла изображения
    const [selectedImage, setSelectedImage] = useState(null); // Отображение выбранного изображения
    const [isUserRegistered, setIsUserRegistered] = useState(true); // Флаг регистрации пользователя

    useEffect(() => {
        const authToken = getAuthToken();
        if (authToken) {
            // Выполните два запроса одновременно
            Promise.all([
                fetch('http://localhost:8887/contractor', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                }),
                fetch('http://localhost:8887/contractor/image', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                    },
                })
            ])
            .then(([profileResponse, photoResponse]) => {
                // Обработайте JSON ответ для профиля
                return Promise.all([
                    profileResponse.json(),
                    photoResponse.blob() // Получите изображение как blob
                ]);
            })
            .then(([profileData, photoBlob]) => {
                if (profileData.success === 1) {
                    setFormData(profileData.profile); // Заполняем форму данными профиля
                    setIsEditable(false); // Поля изначально не редактируемы
                } else {
                    setIsUserRegistered(false); // Если профиль не найден, показываем форму регистрации
                }

                // Создайте URL для изображения и установите его в состояние
                const photoURL = URL.createObjectURL(photoBlob);
                setSelectedImage(photoURL);

                setIsDataLoaded(true); // Данные загружены
            })
            .catch(error => {
                console.error('Ошибка при загрузке данных:', error);
                setIsDataLoaded(true); // Устанавливаем флаг, чтобы показать ошибку или форму регистрации
            });
        } else {
            setIsUserRegistered(false); // Если токена нет, показываем форму регистрации
            setIsDataLoaded(true); // Данные не нужны, так как это форма регистрации
        }
    }, []);

    const handleImageChange = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            setImageFile(file); // Сохраняем файл изображения
            const imageURL = URL.createObjectURL(file);
            setSelectedImage(imageURL); // Отображаем изображение
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImageFile(null); // Очищаем выбранное изображение
    };

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
        const authToken = getAuthToken();
        try {
            const response = await fetch('http://localhost:8887/contractor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(formData)
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

    const handleSubmitImage = async () => {
        const authToken = getAuthToken();
        if (!imageFile) {
            alert('Пожалуйста, выберите изображение для загрузки.');
            return;
        }

        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const response = await fetch('http://localhost:8887/contractor/image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
                body: formData,
            });

            if (response.ok) {
                alert('Изображение успешно загружено!');
                setImageFile(null); // Сбрасываем выбранное изображение после загрузки
            } else {
                alert('Ошибка при загрузке изображения.');
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
            <h2>Данные для анкеты</h2>
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
                placeholder="Ваши расценки"
                value={formData.prices}
                onChange={handleInputChange}
                disabled={!isEditable}
            />
            <button onClick={isEditable ? handleSubmitProfile : handleEdit}>
                {isEditable ? 'Сохранить изменения' : 'Редактировать'}
            </button>

            <h2>Фото профиля</h2>
            {selectedImage && (
                <div>
                    <img src={selectedImage} alt="Фото профиля" style={{ width: '100px', height: '100px' }} />
                    <button onClick={handleRemoveImage}>Удалить</button>
                </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} />
            <button onClick={handleSubmitImage}>Загрузить фото</button>
        </div>
    );
};

export default FormPage;
