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
    // const [isUserRegistered, setIsUserRegistered] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageFile, setImageFile] = useState(null); // Хранение файла изображения

    const [selectedImages, setSelectedImages] = useState([]); // Массив для хранения выбранных изображений
    const [imageFiles, setImageFiles] = useState([]); // Массив для файлов изображений

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
                fetch(url + '/profile/avatar', {
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
                    photoResponse.json() // Теперь ожидаем Base64 строку
                ]);
            })
            .then(([profileData, photoData]) => {
                if (profileData.success === 1) {
                    setProfileData(profileData.profile); // Заполняем форму данными профиля
                    setIsEditable(false); // Поля изначально не редактируемы
                } else {
                    setIsUserRegistered(false); // Если профиль не найден, показываем форму регистрации
                }
    
                // Если фотография пришла как Base64, устанавливаем её в состояние
                const base64Image = `data:image/jpeg;base64,${photoData.image}`; // Замените на соответствующее поле
                setSelectedImage(base64Image);
    
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
    
    // Обработка изменения файлов
    const handleImageChange = (event) => {
        const files = Array.from(event.target.files); // Преобразуем FileList в массив

        // Ограничение на количество файлов (не более 3)
        if (files.length > 3) {
            alert('Вы можете загрузить не более 3 изображений.');
            return;
        }

        // Создаем массив URL для отображения превью изображений
        const imageUrls = files.map(file => URL.createObjectURL(file));
        
        setSelectedImages(imageUrls); // Устанавливаем URL для отображения
        setImageFiles(files); // Сохраняем сами файлы для отправки
    };

    // Удаление одного изображения
    const handleRemoveImages = (index) => {
        const updatedImages = selectedImages.filter((_, i) => i !== index);
        const updatedFiles = imageFiles.filter((_, i) => i !== index);
        setSelectedImages(updatedImages);
        setImageFiles(updatedFiles);
    };

  // Отправка фото на сервер
  const handleSubmitPhotos = async () => {
    if (imageFiles.length === 0) {
        alert('Пожалуйста, выберите как минимум одно изображение.');
        return;
    }

    const formData = new FormData();
    imageFiles.forEach((file, index) => {
        formData.append(`image_${index + 1}`, file); // Добавляем каждый файл в formData
    });

    try {
        const response = await fetch(url + '/passport/photos', { // Укажи здесь свой URL
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`, // Укажи здесь свой токен
            },
            body: formData, // Отправляем FormData с изображениями
        });

        const data = await response.json();

        if (data.success) {
            alert('Фото успешно загружены!');
            // Обновляем состояние после успешной загрузки
            setSelectedImages([]);
            setImageFiles([]);
        } else {
            alert('Ошибка при загрузке фото.');
        }
    } catch (error) {
        console.error('Ошибка при загрузке фото:', error);
        alert('Произошла ошибка. Попробуйте снова.');
    }
};



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

    const handleImagesChange = (event) => {
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
            const response = await fetch(url + '/profile/avatar', {
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
            <h2>Ваши фото паспортных данных</h2>
            <div>
                {selectedImages.length > 0 ? (
                    <div>
                        {selectedImages.map((image, index) => (
                            <div key={index} style={{ marginBottom: "10px" }}>
                                <img
                                    src={image}
                                    alt={`Uploaded ${index + 1}`}
                                    style={{ width: "300px", marginTop: "20px" }}
                                />
                                <button 
                                    onClick={() => handleRemoveImages(index)} 
                                    style={{ display: "block", marginTop: "10px" }}
                                >
                                    Удалить
                                </button>
                            </div>
                        ))}
                        <button onClick={handleSubmitPhotos} style={{ display: "block", marginTop: "10px" }}>
                            Сохранить все фото
                        </button>
                    </div>
                ) : (
                    <div>
                        <input 
                            type="file" 
                            accept="image/*" 
                            multiple // Позволяет выбрать несколько изображений
                            onChange={handleImagesChange}
                        />
                    </div>
                )}
            </div>
            <h2>Ваше фото профиля</h2>
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
