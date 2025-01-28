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

    const [images, setImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

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
                            // console.log('Данные лица:', entityData); // Логируем данные лица
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

    useEffect(() => {
        const fetchImages = async () => {
            if (questionnaire?.questionnaireImages) {
                const loadedImages = await Promise.all(
                    questionnaire.questionnaireImages.map(async (imagePath) => {
                        const params = new URLSearchParams({ imagePath });
                        const response = await fetch(`${url}/questionnaire/image?${params.toString()}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${getAuthToken()}`,
                            },
                        });

                        if (!response.ok) {
                            console.error(`Ошибка загрузки изображения: ${imagePath}`);
                            return null;
                        }

                        const blob = await response.blob();
                        return URL.createObjectURL(blob); // Создаем объект URL для изображения
                    })
                );

                setImages(loadedImages.filter((img) => img !== null)); // Исключаем неудачные загрузки
            }
        };

        if (questionnaire) {
            fetchImages();
        }
    }, [questionnaire, url]);

    const handleEditClick = () => setIsEditable(true);
    const handleOpenReaction = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleImageClick = (image) => {
        setSelectedImage(image); // Устанавливаем выбранное изображение
    };

    const handleCloseImageModal = () => {
        setSelectedImage(null); // Закрываем модальное окно
    };

    const handleAddImages = (e) => {
        const files = Array.from(e.target.files);
        setNewImages((prev) => [...prev, ...files]); // Добавляем новые файлы к уже выбранным
    };

    const handleCancelUpload = () => {
        setNewImages([]); // Очищаем список новых фотографий
    };

    const handleUploadImages = async () => {
        if (newImages.length === 0) {
            alert('Вы не выбрали фотографии для загрузки.');
            return;
        }

        try {
            const formData = new FormData();
            newImages.forEach((file) => formData.append('files', file)); // Добавляем все выбранные файлы
            formData.append('questionnaireId', id); // Добавляем ID объявления
            formData.append('type', 'image');
            const response = await fetch(`${url}/questionnaire/files`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`, // Заголовок авторизации
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Ошибка при загрузке фотографий: ${response.status}`);
            }

            alert('Фотографии успешно загружены.');
            setNewImages([]); // Очищаем локальное состояние после успешной отправки
            setTrigger(!trigger); // Обновляем данные объявления
        } catch (error) {
            console.error('Ошибка при загрузке фотографий:', error);
            alert('Не удалось загрузить фотографии.');
        }
    };

    const handleDeleteImage = async (filePath) => {
        if (window.confirm('Вы уверены, что хотите удалить это фото?')) {
            try {
                const params = new URLSearchParams({ filePath });
                const response = await fetch(`${url}/questionnaire/file?${params.toString()}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${getAuthToken()}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка при удалении изображения: ${response.status}`);
                }

                alert('Изображение успешно удалено.');

                // Удаляем изображение из локального состояния после успешного удаления
                setImages((prevImages) => prevImages.filter((img) => img !== filePath));
                setQuestionnaire((prev) => ({
                    ...prev,
                    questionnaireImages: prev.questionnaireImages.filter((img) => img !== filePath),
                }));
            } catch (error) {
                console.error('Ошибка при удалении изображения:', error);
                alert('Не удалось удалить изображение.');
            }
        }
    };

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
        // console.log(id)
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

                <label htmlFor="prices">Расценки</label>
                <input
                    type="text"
                    name="prices"
                    id="prices"
                    value={questionnaire.prices || ''}
                    onChange={handleInputChange}
                    disabled={!isEditable}
                    style={styles.input}
                />

                <div>
                    <div>
                        <h4>Прикрепленные фотографии:</h4>
                        {images.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {questionnaire.questionnaireImages.map((imagePath, index) => (
                                    <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                                        <img
                                            src={images[index]}
                                            alt={`Фото ${index + 1}`}
                                            style={{
                                                width: '150px',
                                                height: '150px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => handleImageClick(images[index])} // Открытие модального окна
                                        />
                                        {isEditable && (
                                            <button
                                                onClick={() => handleDeleteImage(imagePath)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '5px',
                                                    right: '5px',
                                                    background: 'red',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '20px',
                                                    height: '20px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>Фотографии отсутствуют</p>
                        )}
                    </div>

                    {isEditable && (
                        <div style={{ marginTop: '20px' }}>
                            <h4>Добавить новые фотографии:</h4>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleAddImages}
                            />
                            {newImages.length > 0 && (
                                <div>
                                    <h5>Выбранные фотографии:</h5>
                                    <ul>
                                        {newImages.map((file, index) => (
                                            <li key={index}>{file.name}</li>
                                        ))}
                                    </ul>
                                    <button onClick={handleUploadImages} style={{ marginRight: '10px', background: 'green', color: 'white', padding: '10px' }}>
                                        Отправить
                                    </button>
                                    <button onClick={handleCancelUpload} style={{ background: 'red', color: 'white', padding: '10px' }}>
                                        Отменить
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {selectedImage && (
                        <div
                            onClick={handleCloseImageModal}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                zIndex: 1000,
                                cursor: 'pointer',
                            }}
                        >
                            <img
                                src={selectedImage}
                                alt="Просмотр изображения"
                                style={{
                                    maxWidth: '90%',
                                    maxHeight: '90%',
                                    borderRadius: '10px',
                                }}
                            />
                        </div>
                    )}
                </div>

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
                    receiverItemName={questionnaire.workCategories}
                />

                {/* {console.log(questionnaire.workCategories)} */}
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
