import React, { useState, useEffect } from 'react';




// Функция для получения токена
const getAuthToken = () => localStorage.getItem('authToken');
function formField(type, label, name, placeholder) {
                return <div>
                <label>{label}</label>
                <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    // value={FormData.?} // Значение поля заполняется данными из состояния
                    onChange={handleInputChange}
                    disabled={!isEditable}
                />
            </div>
}

const FormPage = () => {
    const [FormData, setFormData] = useState({
        categoriesOfWork: '',
        name: '',
        surname: '',
        photo: '', // Фото Спеца
        reviews: '', // Отзывы
        completedProjects: '', // Законченные проекты с фото
        rating: '', // Оценка
        hasTeam: '', // Есть ли команда
        team: '', // Описание команды
        hasEdu: '', // Есть ли образование
        eduEst: '', // Образовательное учреждение
        eduDates: '', // Даты начала и окончания образования
        workExp: '', // Опыт работы (не только на сервисе?)
        regDate: '', // Дата регистрации для того, чтобы отображать, с какого числа на сервисе и сколько там времени. Пример: На сервисе с 02.2024 (80 дней)
        selfInfo: '', // Спец рассказывает о себе
    
        // isPassportConfirmed: false,
    });
    const [token, setToken] = useState('');
    const [isEditable, setIsEditable] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [isUserRegistered, setIsUserRegistered] = useState(true);

    useEffect(() => {
        const authToken = getAuthToken();
        if (authToken) {
            setToken(authToken);
            
            fetch('http://localhost:8887/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success === 1) {
                    setFormData(data.profile); // Заполняем форму данными профиля
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
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: checked
        }));
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
                body: JSON.stringify(FormData),
            });

            const data = await response.json();

            if (data.success) {
                alert('Профиль успешно обновлен!');
                setFormData(data.profile); // Обновляем данные профиля
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
        return <div>Ждём-ссс...</div>; // Пока данные загружаются, показываем загрузку
    }

    return (
        <div>
            <h1>Личные данные</h1>
            <formField type = "text" />
            <div>
                <label>Дата рождения:</label>
                <input
                    type="date"
                    name="birthday"
                    value={FormData.birthday} // Значение поля заполняется данными из состояния
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

export default FormPage;
