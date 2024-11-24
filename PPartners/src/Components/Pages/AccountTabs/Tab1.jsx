import React, { useState, useEffect } from 'react';
import ImageLoader from './ImageLoader';

// Функция для получения токена
const getAuthToken = () => localStorage.getItem('authToken');
let url = localStorage.getItem('url');

const FormField = ({ type, label, name, placeholder, value, onChange, disabled, hidden }) => {
    if (hidden) {
        return null
    }
    else{
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
    
    } 
};


const ProfilePage = () => {    
    const [profileData, setProfileData] = useState({});
    const [isEditable, setIsEditable] = useState(false);
    const [error, setError] = useState(null);

    const fieldsToSend = {
        surname: profileData.surname,
        name: profileData.name,
        birthday: profileData.birthday,
        email: profileData.email,
        phoneNumber: profileData.phoneNumber,

    };
    const [avatarPath, setAvatarPath] = useState(null);
    const [passportPhoto1, setPassportPhoto1] = useState(null);
    const [passportPhoto2, setPassportPhoto2] = useState(null);
    const [passportPhoto3, setPassportPhoto3] = useState(null);

    const [place, setPlace] = useState('profile');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${url}/profile`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}`,
                    }
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status}`);
                }

                const data = await response.json();
                setProfileData(data.profile)

                setAvatarPath(data.profile.avatar); 
                let passportPath = data.profile.passport
                // console.log(passportPath)

                setPassportPhoto1(passportPath[0])
                setPassportPhoto2(passportPath[1])
                setPassportPhoto3(passportPath[2])

                console.log(passportPath[2])


            } catch (error) {
                setError(`Ошибка при выполнении запроса: ${error.message}`);
            }
        };

        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Обновляем только измененное поле
        setProfileData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleEdit = () => {
        setIsEditable(true);
    };

    const handleCancel = () => {
        setIsEditable(false);
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`${url}/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify(fieldsToSend), // Отправляем обновленные данные профиля
            });

            if (!response.ok) {
                throw new Error(`Ошибка сети: ${response.status}`);
            }

            const data = await response.json();
            alert('Данные успешно сохранены!');
            setIsEditable(false); // Выключаем режим редактирования после сохранения
        } catch (error) {
            setError(`Ошибка при сохранении данных: ${error.message}`);
        }
    };

    return (
        <div>
            <h2>Ваши данные</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {profileData ? (
                <div>
                    <FormField
                        type="text"
                        label="Почта"
                        name="email"
                        placeholder="Почта"
                        value={profileData.email || ''}
                        onChange={handleInputChange}
                        disabled={!isEditable}
                    />

                    <FormField
                        type="text"
                        label="Номер телефона"
                        name="phoneNumber"
                        placeholder="Номер телефона"
                        value={profileData.phoneNumber || ''}
                        // onChange={handleInputChange}
                        disabled={true}
                    />

                    <FormField
                        type="text"
                        label="Имя"
                        name="name"
                        placeholder="Имя"
                        value={profileData.name || ''}
                        onChange={handleInputChange}
                        disabled={!isEditable}
                    />

                    <FormField
                        type="text"
                        label="Фамилия"
                        name="surname"
                        placeholder="Фамилия"
                        value={profileData.surname || ''}
                        onChange={handleInputChange}
                        disabled={!isEditable}
                    />

                    <FormField
                        type="date"
                        label="Дата рождения"
                        name="birthday"
                        placeholder="Дата рождения"
                        value={profileData.birthday || ''}
                        onChange={handleInputChange}
                        disabled={!isEditable}
                    />

                    {!isEditable ? (
                        <button onClick={handleEdit}>Редактировать</button>
                    ) : (
                        <div>
                            <button onClick={handleSave}>Сохранить</button>
                            <button onClick={handleCancel}>Отмена</button>
                        </div>
                    )}

                    <ImageLoader imagePath={avatarPath} label="Ваш аватар" place={place}/>

                    <ImageLoader imagePath={passportPhoto1} label="Страница паспорта 1" place={place}/>

                    <ImageLoader imagePath={passportPhoto2} label="Страница паспорта 2" place={place}/>

                    <ImageLoader imagePath={passportPhoto3} label="Страница паспорта 3" place={place}/>


                </div>
            ) : (
                <div>
                    <h2>Нет данных профиля</h2>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
