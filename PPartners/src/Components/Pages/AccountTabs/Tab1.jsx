import React, { useState, useEffect } from 'react';

const ImageUploader = ({ label, onUpload, imagePath }) => {
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            await onUpload(file);
        }
    };

    return (
        <div>
            <label>{label}</label>
            {imagePath && <img src={imagePath} alt={label} style={{ width: '100px', height: '100px', display: 'block' }} />}
            <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
    );
};

const FormField = ({ type, label, name, placeholder, value, onChange, disabled }) => {
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

const ProfilePage = () => {
    const [profileData, setProfileData] = useState({
        surname: '',
        name: '',
        birthday: '',
        email: '',
        phoneNumber: '',
    });
    const [avatarPath, setAvatarPath] = useState(null);
    const [passportPhoto1, setPassportPhoto1] = useState(null);
    const [passportPhoto2, setPassportPhoto2] = useState(null);
    const [passportPhoto3, setPassportPhoto3] = useState(null);
    const [isEditable, setIsEditable] = useState(false);
    const [error, setError] = useState(null);
    const url = localStorage.getItem('url');
    const authToken = localStorage.getItem('authToken');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${url}/profile`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status}`);
                }

                const data = await response.json();
                if (data.profile) {
                    setProfileData(data.profile);
                    setAvatarPath(data.profile.avatar || null);
                    const passportPath = data.profile.passport || [];
                    setPassportPhoto1(passportPath[0] || null);
                    setPassportPhoto2(passportPath[1] || null);
                    setPassportPhoto3(passportPath[2] || null);
                    setIsEditable(false);
                } else {
                    setIsEditable(true); // Если данных нет, сразу включаем режим редактирования
                }
            } catch (error) {
                setError(`Ошибка при загрузке данных профиля: ${error.message}`);
            }
        };

        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`${url}/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(profileData),
            });

            if (!response.ok) {
                throw new Error(`Ошибка сети: ${response.status}`);
            }

            alert('Данные успешно сохранены!');
            setIsEditable(false);
        } catch (error) {
            setError(`Ошибка при сохранении данных: ${error.message}`);
        }
    };

    const handleAvatarUpload = async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch(`${url}/profile/avatar`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Ошибка загрузки аватара: ${response.status}`);
            }

            const data = await response.json();
            setAvatarPath(data.avatar);
            alert('Аватар успешно загружен!');
        } catch (error) {
            setError(`Ошибка загрузки аватара: ${error.message}`);
        }
    };

    const handlePassportUpload = async (file, index) => {
        const formData = new FormData();
        formData.append('passport', file);

        try {
            const response = await fetch(`${url}/profile/passport`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Ошибка загрузки паспорта ${index + 1}: ${response.status}`);
            }

            const data = await response.json();
            alert(`Фото паспорта ${index + 1} успешно загружено!`);

            // Обновляем соответствующую фотографию
            if (index === 0) setPassportPhoto1(data.passport);
            if (index === 1) setPassportPhoto2(data.passport);
            if (index === 2) setPassportPhoto3(data.passport);
        } catch (error) {
            setError(`Ошибка загрузки паспорта ${index + 1}: ${error.message}`);
        }
    };

    return (
        <div>
            <h2>Ваши данные</h2>

            {error && <p style={{ color: 'red' }}>{error}</p>}

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

            {isEditable ? (
                <button onClick={handleSave}>Сохранить</button>
            ) : (
                <button onClick={() => setIsEditable(true)}>Редактировать</button>
            )}

            <h3>Загрузите фото</h3>

            <ImageUploader label="Загрузить аватар" imagePath={avatarPath} onUpload={handleAvatarUpload} />
            <ImageUploader
                label="Загрузить фото паспорта 1"
                imagePath={passportPhoto1}
                onUpload={(file) => handlePassportUpload(file, 0)}
            />
            <ImageUploader
                label="Загрузить фото паспорта 2"
                imagePath={passportPhoto2}
                onUpload={(file) => handlePassportUpload(file, 1)}
            />
            <ImageUploader
                label="Загрузить фото паспорта 3"
                imagePath={passportPhoto3}
                onUpload={(file) => handlePassportUpload(file, 2)}
            />
        </div>
    );
};

export default ProfilePage;
