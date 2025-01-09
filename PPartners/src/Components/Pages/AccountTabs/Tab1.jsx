import React, { useState, useEffect } from 'react';
import ImageLoader from './ImageLoader'
import AddEntityWindow from './AddEntityWindow'
import { useProfile } from '../../Context/ProfileContext';
import { useNavigate, useLocation } from 'react-router-dom';

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
            {/* {imagePath && <img src={imagePath}  style={{ width: '100px', height: '100px', display: 'block' }} />} */}
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

const Entities = ({ onSelectEntity, triggerGet }) => {
    const url = localStorage.getItem('url');
    const authToken = localStorage.getItem('authToken');
    const { isSpecialist } = useProfile();

    const [legalEntities, setLegalEntities] = useState([]);
    const [persons, setPersons] = useState([]);
    const [selectedEntity, setSelectedEntity] = useState(null); // ID выбранного лица

    const navigate = useNavigate();

    useEffect(() => {
        if (selectedEntity) {
            navigate(`/entity/${selectedEntity}`);
        }
    }, [selectedEntity, navigate]);
    

    useEffect(() => {
        // onTrigger()
        const fetchDataLegal = async () => {
            try {
                const response = await fetch(`${url}/${isSpecialist ? 'contractor' : 'customer'}/legal-entity`, {
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
                setLegalEntities(data);
            } catch (error) {
                console.error('Ошибка при загрузке юрлиц:', error.message);
            }
        };

        const fetchDataPerson = async () => {
            try {
                const response = await fetch(`${url}/${isSpecialist ? 'contractor' : 'customer'}/person`, {
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
                setPersons(data);
            } catch (error) {
                console.error('Ошибка при загрузке физлиц:', error.message);
            }
        };

        fetchDataLegal();
        fetchDataPerson();
    }, [isSpecialist, url, authToken, triggerGet]);

    const handleSelectEntity = (id) => {
        setSelectedEntity(id);
        onSelectEntity(id); // Передаём выбранный ID в родительский компонент
    };

    return (
        <div style={{ display: 'flex', gap: '20px' }}>
            {/* Левый столбец - Юридические лица */}
            <div style={{ flex: 1 }}>
                <h3 style={{ textAlign: 'center', color: 'white' }}>Юридические лица</h3>
                {legalEntities.length > 0 ? (
                    legalEntities.map((entity) => (
                        <div
                            key={entity.id}
                            onClick={() => handleSelectEntity(entity.id)}
                            style={{
                                padding: '10px',
                                margin: '5px 0',
                                backgroundColor: selectedEntity === entity.id ? '#4114f5' : '#bd0999',
                                border: '1px solid blue',
                                borderRadius: '5px',
                                cursor: 'pointer',
                            }}
                        >
                            <strong>{entity.firm}</strong>
                            <p>ИНН: {entity.inn}</p>
                        </div>
                    ))
                ) : (
                    <p style={{ textAlign: 'center', color: 'white' }}>У вас нет зарегистрированных юридических лиц</p>
                )}
            </div>

            {/* Правый столбец - Физические лица */}
            <div style={{ flex: 1 }}>
                <h3 style={{ textAlign: 'center', color: 'white' }}>Физические лица</h3>
                {persons.length > 0 ? (
                    persons.map((person) => (
                        <div
                            key={person.id}
                            onClick={() => handleSelectEntity(person.id)}
                            style={{
                                padding: '10px',
                                margin: '5px 0',
                                backgroundColor: selectedEntity === person.id ? '#4114f5' : '#bd0999',
                                border: '1px solid green',
                                borderRadius: '5px',
                                cursor: 'pointer',
                            }}
                        >
                            <strong>{person.fullName}</strong>
                            <p>ИНН: {person.inn}</p>
                        </div>
                    ))
                ) : (
                    <p style={{ textAlign: 'center', color: 'white' }}>У вас нет зарегистрированных физических лиц</p>
                )}
            </div>
        </div>
    );
};


const ProfilePage = () => {
    const [profileData, setProfileData] = useState({
        surname: '',
        patronymic: '',
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
    const { isSpecialist } = useProfile();

    const [fullName, setFullName] = useState("");
    // Работа с модальным окном
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const [legal, setLegal] = useState({});
    const [person, setPerson] = useState({});

    const [triggerGet, setTriggerGet] = useState(false);

    const toggleTriggerGet = () => {
        setTriggerGet((prev) => !prev);
    };

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
                    setFullName(data.profile.surname + ' ' + data.profile.name[0] + '.' + data.profile.patronymic[0] + '.')
                    console.log(fullName)
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

    useEffect(() => {
        const fetchDataLegal = async () => {
            try {
                const response = await fetch(`${url}/${isSpecialist ? 'contractor' : 'customer'}/legal-entity`, {
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
                console.log('Ю', data)
                setLegal(data);
            } catch (error) {
                setError(`Ошибка при загрузке данных профиля: ${error.message}`);
            }
        };

        const fetchDataPerson = async () => {
            try {
                const response = await fetch(`${url}/${isSpecialist ? 'contractor' : 'customer'}/person`, {
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
                console.log('Ф', data)
                setPerson(data)
            } catch (error) {
                setError(`Ошибка при загрузке данных профиля: ${error.message}`);
            }
        };

        fetchDataLegal();
        fetchDataPerson();
    }, [triggerGet]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSelectEntity = (e) => {

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
        formData.append('image', file);

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
        formData.append('image', file);
        formData.append('page', index + 1);
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
                label="Отчество"
                name="patronymic"
                placeholder="Отчество"
                value={profileData.patronymic || ''}
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

            <div>
                <button onClick={openModal}>Добавить новое лицо</button>
                {/* Модальное окно */}
                <AddEntityWindow isOpen={isModalOpen} onClose={closeModal} fullName={fullName} onTrigger={toggleTriggerGet} />
            </div>

            <h3>Фото</h3>
            <ImageLoader imagePath={avatarPath} label={"Ваш аватар"} place={'profile'}></ImageLoader>
            <ImageUploader label="Загрузить аватар" imagePath={avatarPath} onUpload={handleAvatarUpload} />

            <ImageLoader imagePath={passportPhoto1} label={"Первая страница паспорта"} place={'profile'}></ImageLoader>
            <ImageUploader
                label="Загрузить фото паспорта 1"
                imagePath={passportPhoto1}
                onUpload={(file) => handlePassportUpload(file, 0)}
            />

            <ImageLoader imagePath={passportPhoto2} label={"Вторая страница паспорта"} place={'profile'}></ImageLoader>
            <ImageUploader
                label="Загрузить фото паспорта 2"
                imagePath={passportPhoto2}
                onUpload={(file) => handlePassportUpload(file, 1)}
            />

            <ImageLoader imagePath={passportPhoto3} label={"Третья страница паспорта"} place={'profile'}></ImageLoader>
            <ImageUploader
                label="Загрузить фото паспорта 3"
                imagePath={passportPhoto3}
                onUpload={(file) => handlePassportUpload(file, 2)}
            />

            <Entities onSelectEntity={handleSelectEntity} triggerGet={triggerGet} />




        </div>
    );
};

export default ProfilePage;
