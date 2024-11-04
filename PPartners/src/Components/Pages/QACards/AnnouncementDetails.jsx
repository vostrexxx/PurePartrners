import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AnnouncementDetails = () => {
    const { id } = useParams(); // Получаем ID из URL
    const navigate = useNavigate();
    const [announcement, setAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditable, setIsEditable] = useState(false);
    const url = localStorage.getItem('url');

    const getAuthToken = () => {
        return localStorage.getItem('authToken');
    };

    useEffect(() => {
        const fetchData = async () => {
            const params = new URLSearchParams({
                announcementId: id, // передаем ID как query параметр
            });

            try {
                const response = await fetch(`${url}/announcement?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}`,
                    }
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status}`);
                }

                const data = await response.json();

                // Проверяем, успешен ли ответ и есть ли информация об объявлении
                if (data.success === 1 && data.announcement) {
                    setAnnouncement(data.announcement); // Сохраняем данные в состояние
                } else {
                    setError('Информация об объявлении не найдена');
                }
            } catch (error) {
                setError(`Ошибка при выполнении запроса: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, url]);

    const handleEditClick = () => {
        setIsEditable(true);
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
                // const response = await fetch(`${url}/announcement/${id}`, {
                //     method: 'DELETE',
                //     headers: {
                //         'Authorization': `Bearer ${getAuthToken()}`,
                //     },
                // });

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
                    navigate('/main'); // Перенаправление после успешного удаления
                } else {
                    setError('Не удалось удалить объявление');
                }
            } catch (error) {
                setError(`Ошибка при удалении: ${error.message}`);
            }
        }
    };

    if (loading) return <div>Загрузка данных объявления...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    return (
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

            <label htmlFor="metro">Станция метро</label>
            <input
                type="text"
                name="metro"
                id="metro"
                value={announcement.metro}
                onChange={handleInputChange}
                disabled={!isEditable}
                style={styles.input}
            />

            <label htmlFor="house">Дом</label>
            <input
                type="text"
                name="house"
                id="house"
                value={announcement.house}
                onChange={handleInputChange}
                disabled={!isEditable}
                style={styles.input}
            />

            <label htmlFor="hasOther">Есть ли дополнительные сведения</label>
            <input
                type="checkbox"
                name="hasOther"
                id="hasOther"
                checked={announcement.hasOther}
                onChange={(e) => handleInputChange({ target: { name: 'hasOther', value: e.target.checked } })}
                disabled={!isEditable}
                style={styles.input}
            />
            
            {announcement.hasOther && (
                <>
                    <label htmlFor="other">Дополнительная информация</label>
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

            <label htmlFor="comments">Комментарии</label>
            <input
                type="text"
                name="comments"
                id="comments"
                value={announcement.comments}
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

            <div style={styles.buttonContainer}>
                {!isEditable ? (
                    <>
                        <button onClick={handleEditClick} style={styles.button}>Редактировать</button>
                        <button onClick={handleDeleteClick} style={styles.deleteButton}>Удалить</button>
                    </>
                ) : (
                    <button onClick={handleSaveClick} style={styles.button}>Сохранить</button>
                )}
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
    buttonContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '20px',
    },
    button: {
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
