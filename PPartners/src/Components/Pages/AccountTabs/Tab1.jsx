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

    // Состояние для фото профиля
    const [selectedProfileImage, setSelectedProfileImage] = useState(null);
    const [profileImageFile, setProfileImageFile] = useState(null);

    // Состояние для фото паспортных данных
    const [selectedPassportImages, setSelectedPassportImages] = useState([]);
    const [passportImageFiles, setPassportImageFiles] = useState([]);

    useEffect(() => {
        const authToken = getAuthToken();
        if (authToken) {
            setToken(authToken);
            
            // Запрос на профиль пользователя
            fetch(url + '/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                }
            })
            .then(response => response.json()) // Преобразуем ответ в JSON
            .then(profileData => {
                // Проверяем, успешен ли ответ
                if (profileData.success === 1) {
                    setProfileData(profileData.profile); // Сохраняем данные профиля
                    const imagePath = profileData.profile.avatar;
        
                    // Если аватара нет (avatar === null), не делаем запрос на изображение
                    if (imagePath) {
                        // Создаем новый URL для изображения, не изменяя базовый URL
                        const imageUrl = `${url}/profile/image?imagePath=${encodeURIComponent(imagePath)}`;
    
                        // Запрос для получения аватара
                        fetch(imageUrl, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${authToken}`,
                            }
                        })
                        .then(response => response.blob()) 
                        .then(photoBlob => {
                            const photoURL = URL.createObjectURL(photoBlob);
                            setSelectedProfileImage(photoURL); // Устанавливаем URL для отображения изображения
                            setIsDataLoaded(true); // Данные загружены
                        })
                        .catch(error => {
                            console.error('Ошибка при загрузке аватара:', error);
                            setIsDataLoaded(true); // Устанавливаем флаг загрузки данных
                        });
                    } else {
                        setIsDataLoaded(true); // Если аватара нет, данные загружены
                    }
                } else {
                    setIsDataLoaded(true);
                }
            })
            .catch(error => {
                console.error('Ошибка при загрузке профиля:', error);
                setIsDataLoaded(true);
            });
        } else {
            setIsDataLoaded(true); // Если токена нет, данные не загружаются
        }
    }, []);
    
    

    // Обработка изменения профиля фото
    const handleProfileImageChange = (event) => {
        const file = event.target.files[0];
        setProfileImageFile(file); // Сохраняем файл изображения
        const imageURL = URL.createObjectURL(file);
        setSelectedProfileImage(imageURL); // Отображаем изображение
    };

    // Обработка изменения паспортных фото
    const handlePassportImagesChange = (event) => {
        const files = Array.from(event.target.files); // Преобразуем FileList в массив

        // Ограничение на количество файлов (не более 3)
        if (files.length > 3) {
            alert('Вы можете загрузить не более 3 изображений.');
            return;
        }

        const imageUrls = files.map(file => URL.createObjectURL(file));
        setSelectedPassportImages(imageUrls); // Устанавливаем URL для отображения
        setPassportImageFiles(files); // Сохраняем сами файлы для отправки
    };

    // Отправка фото профиля на сервер
    const handleSubmitProfilePhoto = async () => {
        if (!profileImageFile) {
            alert('Пожалуйста, выберите файл.');
            return;
        }

        const formData = new FormData();
        formData.append('image', profileImageFile); // Добавляем файл в FormData

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
                alert('Фото профиля успешно загружено!');
            } else {
                alert('Ошибка при загрузке фото профиля.');
            }
        } catch (error) {
            console.error('Ошибка при загрузке фото профиля:', error);
        }
    };

    // Отправка паспортных фото на сервер
    const handleSubmitPassportPhotos = async () => {
        if (passportImageFiles.length === 0) {
            alert('Пожалуйста, выберите как минимум одно изображение.');
            return;
        }

        const formData = new FormData();
        passportImageFiles.forEach((file, index) => {
            formData.append(`image_${index + 1}`, file); // Добавляем каждый файл в formData
        });

        try {
            const response = await fetch(url + '/passport/photos', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData, // Отправляем FormData с изображениями
            });

            const data = await response.json();

            if (data.success) {
                alert('Паспортные фото успешно загружены!');
                setSelectedPassportImages([]); // Очищаем изображения после успешной загрузки
                setPassportImageFiles([]);
            } else {
                alert('Ошибка при загрузке паспортных фото.');
            }
        } catch (error) {
            console.error('Ошибка при загрузке паспортных фото:', error);
        }
    };

    // Удаление выбранного изображения паспорта
    const handleRemovePassportImage = (index) => {
        const updatedImages = selectedPassportImages.filter((_, i) => i !== index);
        const updatedFiles = passportImageFiles.filter((_, i) => i !== index);
        setSelectedPassportImages(updatedImages);
        setPassportImageFiles(updatedFiles);
    };

    // Удаление фото профиля
    const handleRemoveProfileImage = () => {
        setSelectedProfileImage(null);
        setProfileImageFile(null); // Очищаем выбранное изображение
    };

    // Логика для редактирования личных данных
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prevData => ({
            ...prevData,
            [name]: value
        }));
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

    if (!isDataLoaded) {
        return <div>Ждём-ссс...</div>;
    }

    return (
        <div>
            <h2>Ваше фото профиля</h2>
            <div>
                {selectedProfileImage ? (
                    <div>
                        <img
                            src={selectedProfileImage}
                            alt="Фото профиля"
                            style={{ width: "300px", marginTop: "20px" }}
                        />
                        <button onClick={handleRemoveProfileImage} style={{ display: "block", marginTop: "10px" }}>
                            Удалить
                        </button>
                        {profileImageFile && (
                            <button onClick={handleSubmitProfilePhoto} style={{ display: "block", marginTop: "10px" }}>
                                Сохранить фото профиля
                            </button>
                        )}
                    </div>
                ) : (
                    <div>
                        <input type="file" accept="image/*" onChange={handleProfileImageChange} />
                    </div>
                )}
            </div>

            <h2>Фото паспортных данных</h2>
            <div>
                {selectedPassportImages.length > 0 ? (
                    <div>
                        {selectedPassportImages.map((image, index) => (
                            <div key={index} style={{ marginBottom: "10px" }}>
                                <img
                                    src={image}
                                    alt={`Паспортное фото ${index + 1}`}
                                    style={{ width: "300px", marginTop: "20px" }}
                                />
                                <button onClick={() => handleRemovePassportImage(index)} style={{ display: "block", marginTop: "10px" }}>
                                    Удалить
                                </button>
                            </div>
                        ))}
                        <button onClick={handleSubmitPassportPhotos} style={{ display: "block", marginTop: "10px" }}>
                            Сохранить все паспортные фото
                        </button>
                    </div>
                ) : (
                    <div>
                        <input type="file" accept="image/*" multiple onChange={handlePassportImagesChange} />
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
            {/* Добавьте остальные поля для редактирования */}
            <button onClick={handleEdit}>Редактировать</button>
            {isEditable && (
                <button onClick={handleSubmitProfile}>Сохранить данные</button>
            )}
        </div>
    );
};

export default ProfilePage;
