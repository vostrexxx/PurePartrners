import React, { useState, useEffect } from 'react';

// Функция для получения токена
const getAuthToken = () => localStorage.getItem('authToken');
let url = localStorage.getItem('url')
const ProfilePage = () => {
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
    const [isUserRegistered, setIsUserRegistered] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageFile, setImageFile] = useState(null); // Хранение файла изображения

    useEffect(() => {
        const authToken = getAuthToken();
        if (authToken) {
            setToken(authToken);
            Promise.all([
                fetch(url + '/profile', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                }),
                fetch(url + '/profile/image', {
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
                    setProfileData(profileData.profile); // Заполняем форму данными профиля
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

    const handleImageChange = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            console.log(file)
            setImageFile(file); // Сохраняем файл изображения
            const imageURL = URL.createObjectURL(file);
            setSelectedImage(imageURL); // Отображаем изображение
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImageFile(null); // Очищаем выбранное изображение
    };

    const handleEdit = () => {
        setIsEditable(true); // Позволяем редактировать поля
    };

    const handleSubmitProfile = async () => {
        try {
            const response = await fetch(url + '/profile', {
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
                setProfileData(data); // Обновляем данные профиля
                setIsEditable(false); // Поля снова становятся не редактируемыми
            } else {
                alert('Ошибка при обновлении профиля.');
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

        const formData = new FormData();
        formData.append('image', imageFile); // Добавляем файл в FormData

        try {
            const response = await fetch(url + '/profile/image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData, // Отправляем FormData
            });

            const data = await response.json();

            if (data.success) {
                alert('Фото успешно загружено!');
                // Обновляем изображение
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
        return <div>Ждём-ссс...</div>; // Пока данные загружаются, показываем загрузку
    }

    return (
        <div>
            <h2>Фото выполненных проектов</h2>
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
            <h2>Личные данные</h2>
            <div>
                <label>Имя:</label>
                <input
                    type="text"
                    name="name"
                    placeholder="Введите имя"
                    value={profileData.name}
                    onChange={handleInputChange}
                    disabled={!isEditable}
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
                    disabled={!isEditable}
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
                    disabled={!isEditable}
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
                    disabled={!isEditable}
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
                    disabled={!isEditable}
                />
            </div>
            <div>
                <label>Дата рождения:</label>
                <input
                    type="date"
                    name="birthday"
                    value={profileData.birthday}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                />
            </div>
            <button onClick={handleEdit}>Редактировать</button>
            {isEditable && (
                <button onClick={handleSubmitProfile}>Сохранить данные</button>
            )}
        </div>
    );
};

export default ProfilePage;
