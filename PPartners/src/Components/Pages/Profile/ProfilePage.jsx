import React, {useState, useEffect} from 'react';
import {useToast} from '../../Notification/ToastContext'
import {BurstModeTwoTone} from "@mui/icons-material";

let url = localStorage.getItem('url')
let phoneNumber = localStorage.getItem('phoneNumber')

// Функция для получения токена
const getAuthToken = () => localStorage.getItem('authToken');

const ProfilePage = () => {
    const showToast = useToast();
    const [profileData, setProfileData] = useState({
        name: '',
        surname: '',
        patronymic: '',
        email: '',
        phoneNumber: phoneNumber,
        birthday: '',
        isPassportConfirmed: false,
    });
    const [token, setToken] = useState('');
    const [isEditable, setIsEditable] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [isUserRegistered, setIsUserRegistered] = useState(true);

    useEffect(() => {
        const authToken = getAuthToken();
        if (authToken) {
            setToken(authToken);

            fetch(url + '/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success === 1) {
                        setProfileData(data.profile); // Заполняем форму данными профиля
                        setIsEditable(false); // Поля изначально не редактируемы
                    } else {
                        setIsUserRegistered(false); // Если профиль не найден, показываем форму регистрации
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
        const {name, value} = e.target;
        setProfileData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e) => {
        const {name, checked} = e.target;
        setProfileData(prevData => ({
            ...prevData,
            [name]: checked
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
                showToast('Профиль успешно обновлен', 'success');
                setProfileData(data.profile); // Обновляем данные профиля
                setIsEditable(false); // Поля снова становятся не редактируемыми
            } else {
                showToast('Ошибка при обновлении профиля', 'danger');
            }
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
            showToast('Произошла ошибка. Попробуйте снова', 'danger');
        }
    };

    if (!isDataLoaded) {
        return <div>Ждём-ссс...</div>;
    }

    return (
        <div>
            <Button onClick={() => {

            }}></Button>
            <h1>Личные данные</h1>
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
                <button onClick={handleSubmitProfile}>Сохранить</button>
            )}
        </div>
    );
};

export default ProfilePage;
