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
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageFile, setImageFile] = useState(null); // Хранение файла изображения
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            const authToken = getAuthToken();
            if (!authToken) {
                console.error('Токен не найден');
                setIsDataLoaded(true);
                return;
            }

            try {
                const [contractorResponse, imageResponse] = await Promise.all([
                    fetch('http://localhost:8887/contractor', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        }
                    }),
                    fetch('http://localhost:8887/contractor/image', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                        }
                    })
                ]);

                if (!contractorResponse.ok) {
                    throw new Error('Ошибка сети при загрузке данных о подрядчике');
                }

                const contractorData = await contractorResponse.json();

                if (contractorData.success === 0) {
                    console.log('Ответ success: 0, устанавливаем значения по умолчанию');
                    setFormData({
                        categoriesOfWork: '',
                        hasTeam: false,
                        team: '',
                        hasEdu: false,
                        eduEst: '',
                        eduDateStart: '',
                        eduDateEnd: '',
                        workExp: '',
                        selfInfo: '',
                        prices: ''
                    });
                } else {
                    setFormData(contractorData.contractor);
                }

                if (!imageResponse.ok) {
                    throw new Error('Ошибка сети при загрузке изображения');
                }
                const imageBlob = await imageResponse.blob();
                if (isMounted) {
                    setSelectedImage(URL.createObjectURL(imageBlob));
                }

            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                if (isMounted) setError('Ошибка загрузки данных. Попробуйте позже.');
            } finally {
                if (isMounted) setIsDataLoaded(true);
            }
        };

        fetchData();

        return () => {
            isMounted = false; // Очищаем состояние при размонтировании
        };
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
        if (window.confirm("Вы уверены, что хотите удалить изображение?")) {
            setSelectedImage(null);
            setImageFile(null); // Очищаем выбранное изображение
        }
    };

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
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Профиль успешно обновлен!');
                setIsEditable(false);
            } else {
                const errorMsg = await response.text();
                console.error('Ошибка:', errorMsg);
                alert(`Ошибка при обновлении профиля: ${errorMsg}`);
            }
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
            alert('Произошла ошибка. Попробуйте снова.');
        }
    };

    const handleSubmitPhoto = async () => {
        if (!imageFile) {
            alert('Пожалуйста, выберите файл.');
            return;
        }

        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);

        try {
            const authToken = getAuthToken();
            if (!authToken) {
                alert('Токен не найден');
                return;
            }

            const response = await fetch('http://localhost:8887/contractor/image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
                body: imageFormData,
            });

            const data = await response.json();

            if (data && data.success) {
                alert('Фото успешно загружено!');
                const photoURL = URL.createObjectURL(imageFile);
                setSelectedImage(photoURL);
            } else {
                alert('Ошибка при загрузке фото.');
            }
        } catch (error) {
            console.error('Ошибка при загрузке фото:', error);
            alert('Произошла ошибка. Попробуйте снова.');
        }
    };

    if (!isDataLoaded) {
        return <div>Загрузка...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h2>Паспортные данные</h2>
            <div>
                {selectedImage ? (
                    <div>
                        <img
                            src={selectedImage}
                            alt="Uploaded"
                            style={{ width: "300px", marginTop: "20px" }}
                        />
                        <button onClick={handleRemoveImage} style={{ display: "block", marginTop: "10px" }}>
                            Удалить
                        </button>
                        {imageFile && (
                            <button onClick={handleSubmitPhoto} style={{ display: "block", marginTop: "10px" }}>
                                Сохранить
                            </button>
                        )}
                    </div>
                ) : (
                    <div>
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                    </div>
                )}
            </div>

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
                        checked={formData.hasTeam}
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
                hidden={!formData.hasTeam}
            />

            <div>
                <label>
                    Есть ли образование?
                    <input
                        type="checkbox"
                        name="hasEdu"
                        checked={formData.hasEdu}
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
                hidden={!formData.hasEdu}
            />
            <FormField
                type="text"
                label="Дата начала обучения"
                name="eduDateStart"
                placeholder="2009"
                value={formData.eduDateStart}
                onChange={handleInputChange}
                disabled={!isEditable}
                hidden={!formData.hasEdu}
            />
            <FormField
                type="text"
                label="Дата окончания обучения"
                name="eduDateEnd"
                placeholder="2023"
                value={formData.eduDateEnd}
                onChange={handleInputChange}
                disabled={!isEditable}
                hidden={!formData.hasEdu}
            />

            <FormField
                type="text"
                label="Опыт работы"
                name="workExp"
                placeholder="Ваш опыт"
                value={formData.workExp}
                onChange={handleInputChange}
                disabled={!isEditable}
            />

            <FormField
                type="text"
                label="Дополнительная информация"
                name="selfInfo"
                placeholder="О себе"
                value={formData.selfInfo}
                onChange={handleInputChange}
                disabled={!isEditable}
            />

            <FormField
                type="text"
                label="Стоимость услуг"
                name="prices"
                placeholder="1000"
                value={formData.prices}
                onChange={handleInputChange}
                disabled={!isEditable}
            />

            {isEditable ? (
                <button onClick={handleSubmitProfile}>Сохранить изменения</button>
            ) : (
                <button onClick={handleEdit}>Редактировать</button>
            )}
        </div>
    );
};

const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

export default FormPage;
