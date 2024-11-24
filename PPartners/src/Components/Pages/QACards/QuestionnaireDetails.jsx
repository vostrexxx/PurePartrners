import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ReactionWindow from '../Agreement/Reaction';

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

    useEffect(() => {
        const fetchData = async () => {
            const params = new URLSearchParams({ questionnaireId: id });

            try {
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
    }, [id, url]);

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

    if (loading) return <div>Загрузка данных анкеты...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    return (
        <div style={styles.container}>
            <h2>Детали анкеты</h2>

            <label htmlFor="categoriesOfWork">Категории работ</label>
            <input
                type="text"
                name="categoriesOfWork"
                id="categoriesOfWork"
                value={questionnaire.categoriesOfWork || ''}
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
