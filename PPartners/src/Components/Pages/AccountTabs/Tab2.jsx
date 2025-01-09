import React, { useState, useEffect } from 'react';
import { useProfile } from '../../Context/ProfileContext'; // Импорт профиля
import { ImTextColor } from 'react-icons/im';
import Card from '../../Previews/Card.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import AutoCompleteInput from './AutoCompleteInput.jsx';

const Entities = ({ onSelectEntity }) => {
    const url = localStorage.getItem('url');
    const authToken = localStorage.getItem('authToken');
    const { isSpecialist } = useProfile();

    const [legalEntities, setLegalEntities] = useState([]);
    const [persons, setPersons] = useState([]);
    const [selectedEntity, setSelectedEntity] = useState(null); // ID выбранного лица

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
    }, [isSpecialist, url, authToken]);

    const handleSelectEntity = (id) => {
        console.log('Выбранное лицо с ID:', id);

        setSelectedEntity(id);
        onSelectEntity(id); // Передаём выбранный ID в родительский компонент
    };

    return (
        <div style={{ display: 'flex', gap: '20px' }}>
            {/* Левый столбец - Юридические лица */}
            <div style={{ flex: 1 }}>
                <h3 style={{ textAlign: 'center', color: 'white' }}>Юридические лица</h3>
                {legalEntities.map((entity) => (
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
                ))}
            </div>

            {/* Правый столбец - Физические лица */}
            <div style={{ flex: 1 }}>
                <h3 style={{ textAlign: 'center', color: 'white' }}>Физические лица</h3>
                {persons.map((person) => (
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
                ))}
            </div>
        </div>
    );
};



const FormField = ({ type, label, name, placeholder, value, onChange, disabled, hidden }) => {
    if (hidden) {
        return null
    }
    else {
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

const QuestionnaireForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        workCategories: '',
        hasEdu: false,
        eduEst: "",
        eduDateStart: '',
        eduDateEnd: '',
        hasTeam: false,
        team: '',
        prices: '',
        selfInfo: '',
        workExp: '',
        entityId: null, // ID выбранного лица
        guarantee: 12
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSelectEntity = (id) => {
        setFormData((prevData) => ({
            ...prevData,
            entityId: id, // Устанавливаем ID выбранного лица
        }));
    };

    const handleCategorySelect = (value) => {
        setFormData((prevData) => ({
            ...prevData,
            workCategories: value, // Обновляем workCategories при выборе
        }));
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
                // setTriggerGet(!triggerGet)

                onSubmit();
            } else {
                const errorMsg = await response.text();
                alert(`Ошибка при добавлении анкеты: ${errorMsg}`);
            }
        } catch (error) {
            // alert('Произошла ошибка. Попробуйте снова.');
        }
    };

    return (
        <div>
            <h3>Создать анкету (Специалист)</h3>
            <form onSubmit={handleSubmit}>
                <AutoCompleteInput
                    label="Категории ваших работ"
                    name="workCategories"
                    placeholder="Введите категорию"
                    onCategorySelect={handleCategorySelect} // Передаем функцию для обновления formData
                />

                <CheckboxField
                    label="Имеется профильное образование?"
                    name="hasEdu"
                    checked={formData.hasEdu}
                    onChange={handleInputChange}
                />
                <FormField
                    type="text"
                    label="Образовательное учреждение"
                    name="eduEst"
                    placeholder="МИРЭА"
                    value={formData.eduEst}
                    onChange={handleInputChange}
                    hidden={!formData.hasEdu} // Управляем видимостью
                />
                <FormField
                    type="date"
                    label="Дата начала обучения"
                    name="eduDateStart"
                    placeholder="Дата старта"
                    value={formData.eduDateStart}
                    onChange={handleInputChange}
                    hidden={!formData.hasEdu}
                />
                <FormField
                    type="date"
                    label="Дата окончания обучения"
                    name="eduDateEnd"
                    placeholder="Дата окончания"
                    value={formData.eduDateEnd}
                    onChange={handleInputChange}
                    hidden={!formData.hasEdu}
                />
                <CheckboxField
                    label="Имеется ли команда?"
                    name="hasTeam"
                    checked={formData.hasTeam}
                    onChange={handleInputChange}
                />
                <FormField
                    type="text"
                    label="Команда"
                    name="team"
                    placeholder="Команда"
                    value={formData.team}
                    onChange={handleInputChange}
                    hidden={!formData.hasTeam}
                />
                <FormField
                    type="text"
                    label="Расценки"
                    name="prices"
                    placeholder="50к баксов"
                    value={formData.prices}
                    onChange={handleInputChange}
                />
                <FormField
                    type="text"
                    label="Информация о себе"
                    name="selfInfo"
                    placeholder="Информация о себе"
                    value={formData.selfInfo}
                    onChange={handleInputChange}
                />
                <FormField
                    type="text"
                    label="Опыт работы"
                    name="workExp"
                    placeholder="Опыт работы"
                    value={formData.workExp}
                    onChange={handleInputChange}
                />

                <FormField
                    type="text"
                    label="Гарантийный срок"
                    name="guarantee"
                    placeholder="Срок гарантии"
                    value={formData.guarantee}
                    onChange={handleInputChange}
                />

                <Entities onSelectEntity={handleSelectEntity} />

                <button type="submit">Сохранить анкету</button>
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
        // house: '', //
        objectName: '', // o
        startDate: '', // 
        finishDate: '', //
        comments: '', // o
        entityId: null, // Устанавливаем ID выбранного лица
        guarantee: 12,
        address: '',
    });

    const handleCategorySelect = (value) => {
        setFormData((prevData) => ({
            ...prevData,
            workCategories: value, // Обновляем workCategories при выборе
        }));
    };

    const handleSelectEntity = (id) => {
        setFormData((prevData) => ({
            ...prevData,
            entityId: id, // Устанавливаем ID выбранного лица
        }));
    };

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
        console.log('Данные формы перед отправкой:', formData);
    
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
            console.error('Ошибка при отправке данных:', error);
        }
    };
    

    return (
        <div>
            <h3>Создать Объявление (Заказчик)</h3>
            <form onSubmit={handleSubmit}>
                <AutoCompleteInput
                    label="Категории ваших работ"
                    name="workCategories"
                    placeholder="Введите категорию"
                    onCategorySelect={handleCategorySelect}
                />
                <FormField
                    type="text"
                    label="Общая стоимость"
                    name="totalCost"
                    placeholder="10000"
                    value={formData.totalCost}
                    onChange={handleInputChange}
                    // disabled={!isEditable}
                // hidden={!formData.hasTeam}
                />
                <CheckboxField
                    label="Цена по договору?"
                    name="hasOther"
                    checked={formData.hasOther}
                    // disabled={!isEditable}
                    onChange={handleInputChange}
                />
                <FormField
                    type="text"
                    label="Цена по договору"
                    name="other"
                    placeholder="Цена по договору"
                    value={formData.other}
                    onChange={handleInputChange}
                    // disabled={!isEditable}
                    hidden={!formData.hasOther} // Управляем видимостью
                />
                <FormField
                    type="text"
                    label="Метро"
                    name="metro"
                    placeholder="Метро"
                    value={formData.metro}
                    onChange={handleInputChange}
                    // disabled={!isEditable}
                // hidden={!formData.hasEdu} // Управляем видимостью
                />
                {/* <FormField
                    type="text"
                    label="Дом"
                    name="house"
                    placeholder="Дом"
                    value={formData.house}
                    onChange={handleInputChange}
                    // disabled={!isEditable}
                // hidden={!formData.hasEdu} // Управляем видимостью
                /> */}
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
                    // disabled={!isEditable}
                // hidden={!formData.hasTeam}
                />
                <FormField
                    type="date"
                    label="Дата начала"
                    name="startDate"
                    placeholder="Дата начала"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    // disabled={!isEditable}
                // hidden={!formData.hasEdu}
                />
                <FormField
                    type="date"
                    label="Дата окончания"
                    name="finishDate"
                    placeholder="Дата окончания"
                    value={formData.finishDate}
                    onChange={handleInputChange}
                    // disabled={!isEditable}
                />
                <FormField
                    type="text"
                    label="Комментарии"
                    name="comments"
                    placeholder="Комментарии"
                    value={formData.comments}
                    onChange={handleInputChange}
                    // disabled={!isEditable}
                />

                <FormField
                    type="text"
                    label="Срок гарантии"
                    name="guarantee"
                    placeholder="Гарантийный срок"
                    value={formData.guarantee}
                    onChange={handleInputChange}
                    // disabled={!isEditable}
                />

                <FormField
                    type="text"
                    label="Адрес"
                    name="address"
                    placeholder="Адрес будущих работ"
                    value={formData.address}
                    onChange={handleInputChange}
                    // disabled={!isEditable}
                />

                <Entities onSelectEntity={handleSelectEntity} />
                <button type="button" onClick={handleSubmit}>Сохранить объявление</button>
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

    const [triggerGet, setTriggerGet] = useState(false);


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
    }, [isSpecialist, triggerGet]);

    const handleCreateClick = () => {
        setIsCreating(true); // Отображаем форму
    };

    const handleFormSubmit = (formData) => {
        console.log('Данные формы:', formData);

        setIsCreating(false); // Скрываем форму после отправки
        setTriggerGet(!triggerGet)

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
                                    <Card title={item.workCategories} onClick={() => handleQueCardClick(item.id)} key={item.id}></Card>
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
                                    <Card title={item.workCategories} onClick={() => handleAnnCardClick(item.id)} key={item.id}></Card>

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
        color: 'black',
        border: '1px solid #ccc',
        padding: '16px',
        margin: '8px 0',
        borderRadius: '4px',
        backgroundColor: '#f9f9f9',
    },
};

export default MainPage;
