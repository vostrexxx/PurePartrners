import React, { useState, useEffect } from 'react';
import { useProfile } from '../../Context/ProfileContext'; // Импорт профиля
import { ImTextColor } from 'react-icons/im';
import Card from '../../Previews/Card.jsx';
import { useNavigate, useLocation } from 'react-router-dom';


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

const CheckboxField = ({ label, name, checked, onChange }) => {
    return (
        <div>
            <label>
                <input
                    type="checkbox"
                    name={name}
                    checked={checked}
                    onChange={onChange}
                />
                {label}
            </label>
        </div>
    );
};

const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

let url = localStorage.getItem('url')

// Компонент формы для анкеты (Специалист)
const QuestionnaireForm = ({ onSubmit, onCancel }) => {
const [isEditable, setIsEditable] = useState(false);

    const [formData, setFormData] = useState({
        categoriesOfWork: '',//o
        hasEdu: '',//o
        eduEst:'',//
        eduDateStart: '',//
        eduDateEnd: '',//
        hasTeam:'',//o
        team: '',//
        prices: '',//o
        selfInfo: '',//o
        workExp: '',//o
    });

    const handleEdit = () => {
        setIsEditable(true);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value // Если это чекбокс, то берем значение `checked`
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const authToken = getAuthToken();
            if (!authToken) {
                alert('Токен не найден');
                return;
            }
            const response = await fetch(`${url}/questionnaire`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert('Анкета успешно добавлена!');
                onSubmit(); // Успешное завершение, закрываем форму
            } else {
                const errorMsg = await response.text();
                alert(`Ошибка при добавлении анкеты: ${errorMsg}`);
            }
        } catch (error) {
            alert('Произошла ошибка. Попробуйте снова.');
        }
    };

    return (
        <div>
            <h3>Создать анкету (Специалист)</h3>
            <form onSubmit={handleSubmit}>
            <FormField
                type="text"
                label="Категории ваших работ"
                name="categoriesOfWork"
                placeholder="Категория работ"
                value={formData.categoriesOfWork}
                onChange={handleInputChange}
                disabled={!isEditable}
                // hidden={!formData.hasTeam}
            />
            <CheckboxField
                label="Имеется профильное образование?"
                name="hasEdu"
                checked={formData.hasEdu}
                disabled={!isEditable}
                onChange={handleInputChange}
            />
            <FormField
                type="text"
                label="Образовательное учреждение"
                name="eduEst"
                placeholder="МИРЭА"
                value={formData.eduEst}
                onChange={handleInputChange}
                disabled={!isEditable}
                hidden={!formData.hasEdu} // Управляем видимостью
            />
            <FormField
                type="date"
                label="Дата начала обучения"
                name="eduDateStart"
                placeholder="Дата старта"
                value={formData.eduDateStart}
                onChange={handleInputChange}
                disabled={!isEditable}
                hidden={!formData.hasEdu} // Управляем видимостью

            />
            <FormField
                type="date"
                label="Дата окончания обучения"
                name="finishDate"
                placeholder="Дата старта"
                value={formData.eduDateEnd}
                onChange={handleInputChange}
                disabled={!isEditable}
                hidden={!formData.hasEdu} // Управляем видимостью
            />
            <CheckboxField
                label="Имеется ли команда?"
                name="hasTeam"
                checked={formData.hasTeam}
                disabled={!isEditable}
                onChange={handleInputChange}
            />
            <FormField
                type="text"
                label="Команда"
                name="team"
                placeholder="Команда"
                value={formData.team}
                onChange={handleInputChange}
                disabled={!isEditable}
                hidden={!formData.hasTeam}
            />
            <FormField
                type="text"
                label="Расценки"
                name="prices"
                placeholder="50к баксов"
                value={formData.prices}
                onChange={handleInputChange}
                disabled={!isEditable}
                // hidden={!formData.hasEdu}
            />
            <FormField
                type="text"
                label="Информация о себе"
                name="selfInfo"
                placeholder="Информация о себе"
                value={formData.selfInfo}
                onChange={handleInputChange}
                disabled={!isEditable}
            />
            <FormField
                type="text"
                label="Опыт работы"
                name="workExp"
                placeholder="опыт работы"
                value={formData.workExp}
                onChange={handleInputChange}
                disabled={!isEditable}
            />
            

            {isEditable ? (
                    <button type="button" onClick={handleSubmit}>Сохранить анкету</button>
                ) : (
                    <button type="button" onClick={handleEdit}>
                        Редактировать
                    </button>
                )}
                <button type="button" onClick={onCancel}>Отмена</button>
            </form>
        </div>
    );
};

// Компонент формы для объявления (Заказчик)
const AnnouncementForm = ({ onSubmit, onCancel }) => {
    const [isEditable, setIsEditable] = useState(false);
    
        const [formData, setFormData] = useState({
            totalCost: '', //
            other: '',// 
            hasOther: false,// o 
            workCategories: '', // o  
            metro: '', //
            house: '', //
            objectName: '', // o
            startDate: '', // 
            finishDate: '', //
            comments: '' // o
        });
    
        // const handleSubmit = async (e) => {
        //     e.preventDefault();
        //     try {
        //         const authToken = getAuthToken();
        //         if (!authToken) {
        //             alert('Токен не найден');
        //             return;
        //         }
        //         const response = await fetch(url + '/customer', {
        //             method: 'POST',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //                 'Authorization': `Bearer ${authToken}`
        //             },
        //             body: JSON.stringify(formData)
        //         });
        //         if (response.ok) {
        //             alert('Профиль успешно обновлен!');
        //             setIsEditable(false);
        //         } else {
        //             const errorMsg = await response.text();
        //             console.error('Ошибка:', errorMsg);
        //             alert(`Ошибка при обновлении профиля: ${errorMsg}`);
        //         }
        //     } catch (error) {
        //         console.error('Ошибка при отправке запроса:', error);
        //         alert('Произошла ошибка. Попробуйте снова.');
        //     }
        // };
    
    
        const handleEdit = () => {
            setIsEditable(true);
        };
    
        const handleInputChange = (e) => {
            const { name, value, type, checked } = e.target;
            setFormData({
                ...formData,
                [name]: type === 'checkbox' ? checked : value // Если это чекбокс, то берем значение `checked`
            });
        };
    
    
        const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                const authToken = getAuthToken();
                if (!authToken) {
                    alert('Токен не найден');
                    return;
                }
                const response = await fetch(`${url}/announcement`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                    body: JSON.stringify(formData),
                });
    
                if (response.ok) {
                    alert('Объявление успешно добавлено!');
                    onSubmit(); // Успешное завершение, закрываем форму
                } else {
                    const errorMsg = await response.text();
                    alert(`Ошибка при добавлении объявления: ${errorMsg}`);
                }
            } catch (error) {
                alert('Произошла ошибка. Попробуйте снова.');
            }
        };    
    
        return (
            <div>
                <h3>Создать Объявление (Заказчик)</h3>
                <form onSubmit={handleSubmit}>
                <FormField
                    type="text"
                    label="Категория работ"
                    name="workCategories"
                    placeholder="Категория работ"
                    value={formData.workCategories}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    // hidden={!formData.hasTeam}
                />
                <FormField
                    type="text"
                    label="Общая стоимость"
                    name="totalCost"
                    placeholder="О10000000000000"
                    value={formData.totalCost}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    // hidden={!formData.hasTeam}
                />
                <CheckboxField
                    label="Цена по договору?"
                    name="hasOther"
                    checked={formData.hasOther}
                    disabled={!isEditable}
                    onChange={handleInputChange}
                />
                <FormField
                    type="text"
                    label="Цена по договору"
                    name="other"
                    placeholder="Цена по договору"
                    value={formData.other}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    hidden={!formData.hasOther} // Управляем видимостью
                />
                <FormField
                    type="text"
                    label="Метро"
                    name="metro"
                    placeholder="Метро"
                    value={formData.metro}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    // hidden={!formData.hasEdu} // Управляем видимостью
    
                />
                <FormField
                    type="text"
                    label="Дом"
                    name="house"
                    placeholder="Дом"
                    value={formData.house}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    // hidden={!formData.hasEdu} // Управляем видимостью
                />
                {/* <CheckboxField
                    label="Имеется ли команда?"
                    name="hasTeam"
                    checked={formData.}
                    disabled={!isEditable}
                    onChange={handleInputChange}
                /> */}
                <FormField
                    type="text"
                    label="Наименование объекта"
                    name="objectName"
                    placeholder="Наименование объекта"
                    value={formData.objectName}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    // hidden={!formData.hasTeam}
                />
                <FormField
                    type="date"
                    label="Дата начала"
                    name="startDate"
                    placeholder="Дата начала"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    // hidden={!formData.hasEdu}
                />
                <FormField
                    type="date"
                    label="Дата окончания"
                    name="finishDate"
                    placeholder="Дата окончания"
                    value={formData.finishDate}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                />
                <FormField
                    type="text"
                    label="Комментарии"
                    name="comments"
                    placeholder="Комментарии"
                    value={formData.comments}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                />
                
    
                {isEditable ? (
                        <button type="button" onClick={handleSubmit}>Сохранить объявление</button>
                    ) : (
                        <button type="button" onClick={handleEdit}>
                            Редактировать
                        </button>
                    )}
                    <button type="button" onClick={onCancel}>Отмена</button>
                </form>
            </div>
        );
    };

// Основной компонент

const MainPage = () => {
    const navigate = useNavigate();

    const { isSpecialist } = useProfile(); // Получаем профиль
    const [isCreating, setIsCreating] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [questionnaires, setQuestionnaires] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Чистим данные при переключении
        setAnnouncements([]);
        setQuestionnaires([]);
        setLoading(true);
        setError(null);

        const fetchData = async () => {
            try {
                let response;
                if (isSpecialist) {
                    // Запрос на анкеты для специалиста
                    response = await fetch(url + '/questionnaire/previews', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getAuthToken()}`,
                        }
                    });
                    const data = await response.json();
                    // Устанавливаем данные под анкеты
                    setQuestionnaires(data.previews || []);
                } else {
                    // Запрос на объявления для заказчика
                    response = await fetch(url + '/announcement/previews', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getAuthToken()}`,
                        }
                    });
                    const data = await response.json();
                    // Устанавливаем данные под объявления
                    setAnnouncements(data.previews || []);
                }
            } catch (error) {
                setError('Ошибка при загрузке данных');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isSpecialist]);

    const handleCreateClick = () => {
        setIsCreating(true); // Отображаем форму
    };

    const handleFormSubmit = (formData) => {
        console.log('Данные формы:', formData);
        setIsCreating(false); // Скрываем форму после отправки
    };

    const handleAnnCardClick = async (id) => {
        // console.log('id:', id);
        navigate(`/announcement/${id}`, { state: { fromLk: true } });
    };
    
    const handleQueCardClick = async (id) => {
        // console.log('id:', id);
        navigate(`/questionnaire/${id}`, { state: { fromLk: true } });
    };
    

    const handleCancel = () => {
        setIsCreating(false); // Отмена создания
    };

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            {!isCreating ? (
                <div>
                    <button onClick={handleCreateClick}>
                        {isSpecialist ? 'Создать анкету' : 'Создать объявление'}
                    </button>
                    
                    {/* Отображаем карточки */}
                    {isSpecialist ? (
                        <div>
                            <h2>Анкеты</h2>
                            {questionnaires.length > 0 ? (
                                questionnaires.map((item) => 
                                    (
                                        <Card title = {item.categoriesOfWork} onClick = {() => handleQueCardClick(item.id)} key={item.id}></Card>

                                    // <div key={item.id} style={styles.card}>
                                    //     <h3>{item.categoriesOfWork}</h3>
                                    //     {/* <p>ID: {item.id}</p> */}
                                    // </div>
                                ))
                            ) : (
                                <p>Нет анкет</p>
                            )}
                        </div>
                    ) : (
                        <div>
                            <h2>Объявления</h2>
                            {announcements.length > 0 ? (
                                announcements.map((item) => (
                                    <Card title = {item.workCategories} onClick = {() => handleAnnCardClick(item.id)} key={item.id}></Card>

                                    // <div key={item.id} style={styles.card}>
                                    //     <h3>{item.workCategories}</h3>
                                    //     {/* <p>ID: {item.id}</p> */}
                                    // </div>
                                ))
                            ) : (
                                <p>Нет объявлений</p>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                isSpecialist ? (
                    <QuestionnaireForm onSubmit={handleFormSubmit} onCancel={handleCancel} />
                ) : (
                    <AnnouncementForm onSubmit={handleFormSubmit} onCancel={handleCancel} />
                )
            )}
        </div>
    );
};

// Простой стиль карточек для отображения
const styles = {
    card: {
        color:'black', 
        border: '1px solid #ccc',
        padding: '16px',
        margin: '8px 0',
        borderRadius: '4px',
        backgroundColor: '#f9f9f9',
    },
};

export default MainPage;
