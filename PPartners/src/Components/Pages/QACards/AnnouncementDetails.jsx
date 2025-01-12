import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ReactionWindow from '../Agreement/Reaction';
import { useProfile } from '../../Context/ProfileContext';
import TopBar from '../TopBar/TopBar';
import EntityCard from '../../Previews/EntityCard'

const AnnouncementDetails = () => {
    const { id } = useParams();
    const [announcement, setAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditable, setIsEditable] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [entityId, setEntityId] = useState(null);
    const [isLegalEntity, setIsLegalEntity] = useState(null);
    const [entityData, setEntityData] = useState(null);
    const [selectedEntityId, setSelectedEntityId] = useState(null)

    const url = localStorage.getItem('url');
    const { isSpecialist } = useProfile();
    const navigate = useNavigate();
    const getAuthToken = () => {
        return localStorage.getItem('authToken');
    };

    const location = useLocation();
    const canEditOrDelete = location.state?.fromLk || false; // Показывать кнопки только если fromLk === true

    const [trigger, setTrigger] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            try {
                // Шаг 1: Получение данных объявления
                const params = new URLSearchParams({ announcementId: id });
                const response = await fetch(`${url}/announcement?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка при получении объявления: ${response.status}`);
                }

                const data = await response.json();

                if (data.success === 1 && data.announcementInfo) {
                    setAnnouncement(data.announcementInfo);

                    // Шаг 2: Получение данных лица
                    const entityId = data.announcementInfo.entityId; // Получаем ID лица из объявления
                    setEntityId(entityId);
                    if (entityId) {
                        const fetchEntity = async (id) => {
                            const entityParams = new URLSearchParams({ customerId: id });
                            const entityResponse = await fetch(`${url}/customer?${entityParams.toString()}`, {
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
                    setError('Информация об объявлении не найдена');
                }
            } catch (error) {
                setError(`Ошибка при выполнении запросов: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, url, trigger]);


    const handleEditClick = () => {
        setIsEditable(true);
    };

    const handleOpenReaction = () => {
        // тут открываем модульное окно

        setIsModalOpen(true); // Открыть модальное окно
    };

    const closeModal = () => {
        // тут открываем модульное окно
        setIsModalOpen(false); // Открыть модальное окно
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAnnouncement((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSaveClick = async () => {
        try {
            const response = await fetch(`${url}/announcement/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify(announcement),
            });

            if (!response.ok) {
                throw new Error(`Ошибка при сохранении данных: ${response.status}`);
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
        if (window.confirm('Вы уверены, что хотите удалить объявление?')) {
            try {
                const params = new URLSearchParams({
                    announcementId: id,
                });

                const response = await fetch(`${url}/announcement?${params.toString()}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${getAuthToken()}`,
                    },
                });


                if (!response.ok) {
                    throw new Error(`Ошибка при удалении объявления: ${response.status}`);
                }

                const data = await response.json();
                if (data.success === 1) {
                    navigate('/account-actions'); // Перенаправление после успешного удаления
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
                const response = await fetch(`${url}/announcement/entity`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                    body: JSON.stringify({ announcementId: id, mode: "link", entityId: selectedEntityId }),
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
                const response = await fetch(`${url}/announcement/entity`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                    body: JSON.stringify({ announcementId: id, mode: "unlink" }),
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
                <h2>Детали объявления</h2>

                <label htmlFor="workCategories">Категории работ</label>
                <input
                    type="text"
                    name="workCategories"
                    id="workCategories"
                    value={announcement.workCategories}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    style={styles.input}
                />

                <label htmlFor="totalCost">Общая стоимость</label>
                <input
                    type="text"
                    name="totalCost"
                    id="totalCost"
                    value={announcement.totalCost}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    style={styles.input}
                />

                <label>Цена по договору:</label>
                <select
                    name="hasOther"
                    value={announcement.hasOther ? 'Да' : 'Нет'}
                    onChange={(e) =>
                        handleInputChange({ target: { name: 'hasOther', value: e.target.value === 'Да' } })
                    }
                    disabled={!isEditable}
                    style={styles.input}
                >
                    <option>Да</option>
                    <option>Нет</option>
                </select>

                {announcement.hasOther && (
                    <>
                        <label htmlFor="other">Цена по договору</label>
                        <input
                            type="text"
                            name="other"
                            id="other"
                            value={announcement.other}
                            onChange={handleInputChange}
                            disabled={!isEditable}
                            style={styles.input}
                        />
                    </>
                )}

                <label htmlFor="metro">Ближайшее метро</label>
                <input
                    type="text"
                    name="metro"
                    id="metro"
                    value={announcement.metro}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    style={styles.input}
                />

                <label htmlFor="address">Полный адрес</label>
                <input
                    type="text"
                    name="address"
                    id="address"
                    value={announcement.address}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    style={styles.input}
                />

                <label htmlFor="objectName">Наименование объекта</label>
                <input
                    type="text"
                    name="objectName"
                    id="objectName"
                    value={announcement.objectName}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    style={styles.input}
                />

                <label htmlFor="startDate">Дата начала</label>
                <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    value={announcement.startDate}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    style={styles.input}
                />

                <label htmlFor="finishDate">Дата окончания</label>
                <input
                    type="date"
                    name="finishDate"
                    id="finishDate"
                    value={announcement.finishDate}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    style={styles.input}
                />

                <label htmlFor="comments">Комментарий</label>
                <input
                    type="text"
                    name="comments"
                    id="comments"
                    value={announcement.comments}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    style={styles.input}
                />

                {announcement.announcementImages ? (
                    <div>
                        <img
                            src={announcement.announcementImages}
                            alt="Фото объявления"
                            style={{ width: "300px", marginTop: "20px" }}
                        />
                    </div>
                ) : (
                    <p>Изображение не предоставлено</p>
                )}


                <div>
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
                </div>

                <ReactionWindow
                    isOpen={isModalOpen} onClose={closeModal}
                    userId={announcement.userId}
                    id={announcement.id}
                    mode={0}
                />
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px', // промежуток между элементами
        maxWidth: '400px', // ширина контейнера
        margin: '0 auto', // центрирование на странице
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

export default AnnouncementDetails;
