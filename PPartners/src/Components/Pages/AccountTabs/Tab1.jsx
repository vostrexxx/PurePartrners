import React, { useState, useEffect } from 'react';

// Функция для получения токена
const getAuthToken = () => localStorage.getItem('authToken');

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
    const [isImageLoaded, setIsImageLoaded] = useState(false); // Новый флаг для загрузки фото
    const [imageFile, setImageFile] = useState(null); // Хранение файла изображения

    useEffect(() => {
        const authToken = getAuthToken();
        if (authToken) {
            setToken(authToken);
            
            // Выполняем два параллельных запроса: один для персональных данных, другой для фото
            Promise.all([
                fetch('http://localhost:8887/profile', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                }),
                fetch('http://localhost:8887/profile/image', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                    },
                }),
            ])
            .then(([profileResponse, photoResponse]) => 
                Promise.all([
                    profileResponse.json(),
                    photoResponse.json()
                ])
            )
            .then(([profileData, photoData]) => {
                if (profileData.success === 1) {
                    setProfileData(profileData.profile); // Заполняем форму данными профиля
                    setIsEditable(false); // Поля изначально не редактируемы
                } else {
                    setIsUserRegistered(false); // Если профиль не найден, показываем форму регистрации
                }

                if (photoData.success === 1 && photoData.photo) {
                    setSelectedImage(photoData.photo); // Устанавливаем URL фото
                    setIsImageLoaded(true); // Фото загружено
                }

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
    }, []); // Пустой массив зависимостей, чтобы запрос выполнялся один раз при монтировании компонента

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
            setImageFile(file); // Сохраняем файл изображения
            const imageURL = URL.createObjectURL(file);
            setSelectedImage(imageURL); // Отображаем изображение
            setIsImageLoaded(false); // Очищаем флаг, пока не загрузим новое фото
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImageFile(null);
        setIsImageLoaded(false); // Фото больше не загружено
    };

    const handleEdit = () => {
        setIsEditable(true); // Позволяем редактировать поля
    };

    const handleSubmitProfile = async () => {
        try {
            const response = await fetch('http://localhost:8887/profile', {
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
                setProfileData(data.profile); // Обновляем данные профиля
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
        formData.append('photo', imageFile); // Добавляем файл в FormData

        try {
            const response = await fetch('http://localhost:8887/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData, // Отправляем FormData
            });

            const data = await response.json();

            if (data.success) {
                alert('Фото успешно загружено!');
                setIsImageLoaded(true); // Устанавливаем флаг, что фото загружено
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
                            Удалить фотографию
                        </button>
                    </div>
                ) : (
                    <div>
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                        <button onClick={handleSubmitPhoto} style={{ display: "block", marginTop: "10px" }}>
                            Сохранить фотографию
                        </button>
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
                    value={profileData.name} // Значение поля заполняется данными из состояния
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
                    value={profileData.surname} // Значение поля заполняется данными из состояния
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
                    value={profileData.patronymic} // Значение поля заполняется данными из состояния
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
                    value={profileData.email} // Значение поля заполняется данными из состояния
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
                    value={profileData.phoneNumber} // Значение поля заполняется данными из состояния
                    onChange={handleInputChange}
                    disabled={!isEditable}
                />
            </div>
            <div>
                <label>Дата рождения:</label>
                <input
                    type="date"
                    name="birthday"
                    value={profileData.birthday} // Значение поля заполняется данными из состояния
                    onChange={handleInputChange}
                    disabled={!isEditable}
                />
            </div>
            <button onClick={handleEdit}>Редактировать</button>
            {isEditable && (
                <button onClick={handleSubmitProfile}>Сохранить</button>
            )}
        </div>
    );
};

export default ProfilePage;
