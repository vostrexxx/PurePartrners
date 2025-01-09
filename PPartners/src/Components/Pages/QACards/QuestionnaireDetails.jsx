import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ReactionWindow from '../Agreement/Reaction';
import { useProfile } from '../../Context/ProfileContext';
import TopBar from '../TopBar/TopBar';
import EntityCard from '../../Previews/EntityCard'


const QuestionnaireDetails = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [questionnaire, setQuestionnaire] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditable, setIsEditable] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const url = localStorage.getItem('url');
    const getAuthToken = () => localStorage.getItem('authToken');
    const canEditOrDelete = location.state?.fromLk || false;

    const [entityId, setEntityId] = useState(null);
    const [isLegalEntity, setIsLegalEntity] = useState(null);
    const [entityData, setEntityData] = useState(null);
    const [selectedEntityId, setSelectedEntityId] = useState(null)

    const [trigger, setTrigger] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Шаг 1: Получение анкеты
                const params = new URLSearchParams({ questionnaireId: id });
                const response = await fetch(`${url}/questionnaire?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status}`);
                }

                const data = await response.json();

                if (data.success === 1 && data.questionnaireInfo) {
                    setQuestionnaire(data.questionnaireInfo);
                    
                    //шаг2
                    const entityId = data.questionnaireInfo.entityId; // Получаем ID лица из объявления
                    setEntityId(entityId);
                    if (entityId) {
                        const fetchEntity = async (id) => {
                            const entityParams = new URLSearchParams({ contractorId: id });
                            const entityResponse = await fetch(`${url}/contractor?${entityParams.toString()}`, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${getAuthToken()}`,
                                },
                            });

                            if (!entityResponse.ok) {
                                throw new Error(`Ошибка при получении данных лица: ${entityResponse.status}`);
                            }

                            const entityData = await entityResponse.json();
                            setIsLegalEntity(entityData.isLegalEntity)
                            setEntityData(entityData)
                            console.log('Данные лица:', entityData); // Логируем данные лица
                        };

                        await fetchEntity(entityId); // Выполняем запрос для получения данных лица
                    } else {
                        console.error('ID лица отсутствует в данных объявления');
                    }
                } else {
                    setError('Информация об анкете не найдена');
                }
            } catch (error) {
                setError(`Ошибка при загрузке данных: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, url, trigger]);


    const handleEditClick = () => setIsEditable(true);
    const handleOpenReaction = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setQuestionnaire((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSaveClick = async () => {
        try {
            const response = await fetch(`${url}/questionnaire/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify(questionnaire),
            });

            if (!response.ok) {
                throw new Error(`Ошибка при сохранении: ${response.status}`);
            }

            const data = await response.json();
            if (data.success === 1) {
                setIsEditable(false);
            } else {
                setError('Не удалось сохранить данные');
            }
        } catch (error) {
            setError(`Ошибка при сохранении: ${error.message}`);
        }
    };

    const handleDeleteClick = async () => {
        if (window.confirm('Вы уверены, что хотите удалить анкету?')) {
            try {
                const params = new URLSearchParams({ questionnaireId: id });

                const response = await fetch(`${url}/questionnaire?${params.toString()}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${getAuthToken()}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка при удалении: ${response.status}`);
                }

                const data = await response.json();
                if (data.success === 1) {
                    navigate('/account-actions');
                } else {
                    setError('Не удалось удалить анкету');
                }
            } catch (error) {
                setError(`Ошибка при удалении: ${error.message}`);
            }
        }
    };

    const handleEventEntity = async (mode) => {
        if (mode === "link") {//annId, mode, enityId
            try {
                const response = await fetch(`${url}/questionnaire/entity`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                    body: JSON.stringify({ questionnaireId: id, mode: "link", entityId: selectedEntityId }),
                });

                if (!response.ok) {
                    throw new Error(`Ошибка применения изменения: ${response.status}`);
                }

            } catch (error) {
                console.error('Ошибка применения изменения:', error);
                alert('Не удалось одобрить изменение.');
            }
        }
        else if (mode === "unlink") {//
            try {
                const response = await fetch(`${url}/questionnaire/entity`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                    body: JSON.stringify({ questionnaireId: id, mode: "unlink" }),
                });

                if (!response.ok) {
                    throw new Error(`Ошибка применения изменения: ${response.status}`);
                }

                alert('Лицо успешно отвязано!');
            } catch (error) {
                console.error('Ошибка привязки лица:', error);
                // alert('Не удалось одобрить изменение.');
            }
        }
        setTrigger(!trigger)
    }

    const handleSelectEntity = (id) => {
        setSelectedEntityId(id);
        console.log(id)
    };


    if (loading) return <div>Загрузка данных анкеты...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    return (
        <div>
            <TopBar />
            <div style={styles.container}>
                <h2>Детали анкеты</h2>

                <label htmlFor="workCategories">Категории работ</label>
                <input
                    type="text"
                    name="workCategories"
                    id="workCategories"
                    value={questionnaire.workCategories || ''}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    style={styles.input}
                />

                <label>Есть ли команда:</label>
                <select
                    name="hasTeam"
                    value={questionnaire.hasTeam ? 'Да' : 'Нет'}
                    onChange={(e) => handleInputChange({ target: { name: 'hasTeam', value: e.target.value === 'Да' } })}
                    disabled={!isEditable}
                    style={styles.input}
                >
                    <option>Да</option>
                    <option>Нет</option>
                </select>

                {questionnaire.hasTeam && (
                    <>
                        <label htmlFor="team">Команда</label>
                        <input
                            type="text"
                            name="team"
                            id="team"
                            value={questionnaire.team || ''}
                            onChange={handleInputChange}
                            disabled={!isEditable}
                            style={styles.input}
                        />
                    </>
                )}

                <label>Есть ли образование:</label>
                <select
                    name="hasEdu"
                    value={questionnaire.hasEdu ? 'Да' : 'Нет'}
                    onChange={(e) => handleInputChange({ target: { name: 'hasEdu', value: e.target.value === 'Да' } })}
                    disabled={!isEditable}
                    style={styles.input}
                >
                    <option>Да</option>
                    <option>Нет</option>
                </select>

                {questionnaire.hasEdu && (
                    <>
                        <label htmlFor="eduEst">Учебное заведение</label>
                        <input
                            type="text"
                            name="eduEst"
                            id="eduEst"
                            value={questionnaire.eduEst || ''}
                            onChange={handleInputChange}
                            disabled={!isEditable}
                            style={styles.input}
                        />

                        <label htmlFor="eduDateStart">Дата начала обучения</label>
                        <input
                            type="date"
                            name="eduDateStart"
                            id="eduDateStart"
                            value={questionnaire.eduDateStart || ''}
                            onChange={handleInputChange}
                            disabled={!isEditable}
                            style={styles.input}
                        />

                        <label htmlFor="eduDateEnd">Дата окончания обучения</label>
                        <input
                            type="date"
                            name="eduDateEnd"
                            id="eduDateEnd"
                            value={questionnaire.eduDateEnd || ''}
                            onChange={handleInputChange}
                            disabled={!isEditable}
                            style={styles.input}
                        />
                    </>
                )}

                <label htmlFor="workExp">Опыт работы</label>
                <input
                    type="text"
                    name="workExp"
                    id="workExp"
                    value={questionnaire.workExp || ''}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    style={styles.input}
                />

                <label htmlFor="selfInfo">Дополнительная информация</label>
                <input
                    type="text"
                    name="selfInfo"
                    id="selfInfo"
                    value={questionnaire.selfInfo || ''}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    style={styles.input}
                />

                <label htmlFor="prices">Стоимость услуг</label>
                <input
                    type="text"
                    name="prices"
                    id="prices"
                    value={questionnaire.prices || ''}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    style={styles.input}
                />

                {questionnaire.questionnaireImages ? (
                    <div>
                        <img
                            src={questionnaire.questionnaireImages}
                            alt="Фото анкеты"
                            style={{ width: '300px', marginTop: '20px' }}
                        />
                    </div>
                ) : (
                    <p>Изображение не предоставлено</p>
                )}

{location.state?.fromLk === null ? null : (
                        <div>
                            {!isEditable && canEditOrDelete ? (
                                <>

                                    <h3>Данные по лицу</h3>
                                    {!entityId ?
                                        (
                                            <div>
                                                <div>Лицо не привязано</div>
                                                <EntityCard onSelectEntity={handleSelectEntity} />
                                                <button onClick={() => handleEventEntity("link")}>Привязать лицо</button>

                                            </div>
                                        ) : (
                                            <>
                                                {entityData ? (
                                                    isLegalEntity ? (
                                                        <div>
                                                            <h3 style={{ textAlign: 'center', color: 'white' }}>Ваше юридическое лицо</h3>
                                                            <div
                                                                style={{
                                                                    padding: '10px',
                                                                    margin: '5px 0',
                                                                    backgroundColor: '#4114f5',
                                                                    border: '1px solid green',
                                                                    borderRadius: '5px',
                                                                    cursor: 'pointer',
                                                                }}
                                                            >
                                                                <strong>{entityData.firm}</strong>
                                                                <p>ИНН: {entityData.inn}</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <h3 style={{ textAlign: 'center', color: 'white' }}>Ваше физическое лицо</h3>
                                                            <div
                                                                style={{
                                                                    padding: '10px',
                                                                    margin: '5px 0',
                                                                    backgroundColor: '#4114f5',
                                                                    border: '1px solid green',
                                                                    borderRadius: '5px',
                                                                    cursor: 'pointer',
                                                                }}
                                                            >
                                                                <strong>{entityData.fullName}</strong>
                                                                <p>ИНН: {entityData.inn}</p>
                                                            </div>
                                                        </div>
                                                    )
                                                ) : (
                                                    <div>Загрузка данных лица...</div>
                                                )}

                                                <button onClick={() => handleEventEntity("unlink")}>Отвязать лицо</button>
                                            </>
                                        )
                                    }

                                    <button onClick={handleEditClick} style={styles.button}>
                                        Редактировать
                                    </button>
                                    <button onClick={handleDeleteClick} style={styles.deleteButton}>
                                        Удалить
                                    </button>
                                </>
                            ) : isEditable ? (
                                <button onClick={handleSaveClick} style={styles.button}>
                                    Сохранить
                                </button>
                            ) : (
                                <button onClick={handleOpenReaction} style={styles.button}>
                                    Откликнуться
                                </button>
                            )}
                        </div>
                    )}

                <ReactionWindow
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    userId={questionnaire.userId}
                    id={questionnaire.id}
                    mode={1}
                />
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '400px',
        margin: '0 auto',
    },
    input: {
        width: '100%',
        padding: '8px',
        marginTop: '4px',
        boxSizing: 'border-box',
    },
    button: {
        marginTop: '20px',
        padding: '10px',
    },
    deleteButton: {
        padding: '10px',
        backgroundColor: 'red',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
    },
};

export default QuestionnaireDetails;
