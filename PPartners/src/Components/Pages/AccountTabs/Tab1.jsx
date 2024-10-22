import React, { useState, useEffect } from 'react';

// Функция для получения токена
const getAuthToken = () => localStorage.getItem('authToken');
let url = localStorage.getItem('url');

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

    // Состояние для трех независимых фото паспорта
    const [passportImage1, setPassportImage1] = useState(null);
    const [passportImageFile1, setPassportImageFile1] = useState(null);

    const [passportImage2, setPassportImage2] = useState(null);
    const [passportImageFile2, setPassportImageFile2] = useState(null);

    const [passportImage3, setPassportImage3] = useState(null);
    const [passportImageFile3, setPassportImageFile3] = useState(null);

    const [imagePath, setImagePath] = useState(null);

    // Загружаем данные профиля и фото
    useEffect(() => {
        const authToken = getAuthToken();
        if (authToken) {
            setToken(authToken);
            
            // Запрос на получение профиля пользователя
            fetch(url + '/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                }
            })
            .then(response => response.json())
            .then(profileData => {
                if (profileData.success === 1) {
                    setProfileData(profileData.profile);
                    setImagePath(profileData.profile.avatar);
                    setIsDataLoaded(true);
                } else {
                    setIsDataLoaded(true); // Если профиль не найден
                }
            })
            .catch(error => {
                console.error('Ошибка при загрузке профиля:', error);
                setIsDataLoaded(true);
            });
        } else {
            setIsDataLoaded(true);
        }
    }, []);

    // Обработка изменения для каждой страницы паспорта
    const handlePassportImageChange = (event, pageNumber) => {
        const file = event.target.files[0];
        const imageURL = URL.createObjectURL(file);

        switch(pageNumber) {
            case 1:
                setPassportImage1(imageURL);
                setPassportImageFile1(file);
                break;
            case 2:
                setPassportImage2(imageURL);
                setPassportImageFile2(file);
                break;
            case 3:
                setPassportImage3(imageURL);
                setPassportImageFile3(file);
                break;
            default:
                break;
        }
    };

    // Отправка фото паспорта на сервер с указанием страницы (page)
    const handleSubmitPassportImage = async (imageFile, page) => {
        if (!imageFile) {
            alert('Пожалуйста, выберите файл.');
            return;
        }

        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('page', page); // Отправляем номер страницы

        try {
            const response = await fetch(`${url}/profile/passport`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                alert(`Фото страницы ${page} паспорта успешно загружено!`);
            } else {
                alert(`Ошибка при загрузке фото страницы ${page}.`);
            }
        } catch (error) {
            console.error(`Ошибка при загрузке фото страницы ${page}:`, error);
        }
    };

    // Удаление фото паспорта с указанием страницы
    const handleRemovePassportImage = async (page) => {
        try {
            const response = await fetch(`${url}/profile/passport`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ page }), // Указываем страницу для удаления
            });

            const data = await response.json();

            if (data.success) {
                alert(`Фото страницы ${page} паспорта успешно удалено!`);
                switch(page) {
                    case 1:
                        setPassportImage1(null);
                        setPassportImageFile1(null);
                        break;
                    case 2:
                        setPassportImage2(null);
                        setPassportImageFile2(null);
                        break;
                    case 3:
                        setPassportImage3(null);
                        setPassportImageFile3(null);
                        break;
                    default:
                        break;
                }
            } else {
                alert(`Ошибка при удалении фото страницы ${page}.`);
            }
        } catch (error) {
            console.error(`Ошибка при удалении фото страницы ${page}:`, error);
        }
    };

    // Рендерим компонент
    return (
        <div>
            {/* Фото профиля */}
            <h2>Ваше фото профиля</h2>
            <div>
                {selectedProfileImage ? (
                    <div>
                        <img
                            src={selectedProfileImage}
                            alt="Фото профиля"
                            style={{ width: "300px", marginTop: "20px" }}
                        />
                    </div>
                ) : (
                    <div>
                        <input type="file" accept="image/*" onChange={event => handlePassportImageChange(event, 0)} />
                    </div>
                )}
            </div>

            {/* Формы для трех страниц паспорта */}
            <h2>Фото страниц паспорта</h2>
            <div>
                {/* Страница 1 */}
                <div>
                    <h3>Страница 1</h3>
                    {passportImage1 ? (
                        <div>
                            <img src={passportImage1} alt="Страница 1 паспорта" style={{ width: "300px", marginTop: "20px" }} />
                            <button onClick={() => handleRemovePassportImage(1)}>Удалить</button>
                        </div>
                    ) : (
                        <div>
                            <input type="file" accept="image/*" onChange={event => handlePassportImageChange(event, 1)} />
                        </div>
                    )}
                    {passportImageFile1 && (
                        <button onClick={() => handleSubmitPassportImage(passportImageFile1, 1)}>Сохранить</button>
                    )}
                </div>

                {/* Страница 2 */}
                <div>
                    <h3>Страница 2</h3>
                    {passportImage2 ? (
                        <div>
                            <img src={passportImage2} alt="Страница 2 паспорта" style={{ width: "300px", marginTop: "20px" }} />
                            <button onClick={() => handleRemovePassportImage(2)}>Удалить</button>
                        </div>
                    ) : (
                        <div>
                            <input type="file" accept="image/*" onChange={event => handlePassportImageChange(event, 2)} />
                        </div>
                    )}
                    {passportImageFile2 && (
                        <button onClick={() => handleSubmitPassportImage(passportImageFile2, 2)}>Сохранить</button>
                    )}
                </div>

                {/* Страница 3 */}
                <div>
                    <h3>Страница 3</h3>
                    {passportImage3 ? (
                        <div>
                            <img src={passportImage3} alt="Страница 3 паспорта" style={{ width: "300px", marginTop: "20px" }} />
                            <button onClick={() => handleRemovePassportImage(3)}>Удалить</button>
                        </div>
                    ) : (
                        <div>
                            <input type="file" accept="image/*" onChange={event => handlePassportImageChange(event, 3)} />
                        </div>
                    )}
                    {passportImageFile3 && (
                        <button onClick={() => handleSubmitPassportImage(passportImageFile3, 3)}>Сохранить</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;