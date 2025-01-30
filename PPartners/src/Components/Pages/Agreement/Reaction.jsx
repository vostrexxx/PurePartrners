import React, { useEffect, useState } from 'react';
import { Button, TextField, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import { useProfile } from '../../Context/ProfileContext';
import Card from '../../Previews/Card';
import { useNavigate, useLocation } from 'react-router-dom';
const ReactionWindow = ({ isOpen, onClose, userId, id, mode, receiverItemName }) => {
    const [selectedPreviewId, setSelectedPreviewId] = useState(null); // Выбранное превью
    const [announcements, setAnnouncements] = useState([]);
    const [questionnaires, setQuestionnaires] = useState([]);
    const [previews, setPreviews] = useState([]);
    const { isSpecialist } = useProfile();
    const getAuthToken = () => localStorage.getItem('authToken');
    const url = localStorage.getItem('url');
    const navigate = useNavigate();
    const [agreementData, setAgreementData] = useState({
        receiverId: userId,
        receiverItemId: id,
        mode: mode,
        initiatorItemId: null,
        comment: "",
        receiverItemName: receiverItemName,

    });



    useEffect(() => {
        // console.log("URL:", agreementData);
        // console.log("AuthToken:", getAuthToken());
        // console.log("isSpecialist:", isSpecialist);

        setAnnouncements([]);
        setQuestionnaires([]);

        const fetchData = async () => {
            try {
                let response;
                if (isSpecialist) {
                    response = await fetch(url + '/questionnaire/previews', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getAuthToken()}`,
                        }
                    });
                    const data = await response.json();
                    // console.log("Анкеты:", data.previews);
                    setPreviews(data.previews || []);
                } else {
                    const params = new URLSearchParams({ isInWork: true });
                    response = await fetch(url + `/announcement/previews?${params.toString()}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getAuthToken()}`,
                        }
                    });
                    const data = await response.json();
                    // console.log("Объявления:", data.previews);
                    setPreviews(data.previews || []);
                }
            } catch (error) {
                console.error("Ошибка при загрузке данных:", error);
                alert("Ошибка при загрузке данных");
            }
        };

        fetchData();


    }, [isSpecialist]);



    const handleSubmit = async () => {
        // console.log(agreementData)
        try {
            const response = await fetch(`${url}/agreement`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify(agreementData),
            });

            if (response.ok) {
                navigate(`/agreement`)
                alert("Успешно отправлено!");
                // onClose(); // Закрываем окно
            } else {
                // const error = await response.json();
                // alert(`Ошибка: ${error.message}`);
            }
        } catch (error) {
            alert("Произошла ошибка отправки данных.");
        }
    };

    return (
        isOpen && (
            <div style={styles.overlay}>
                <div style={styles.modal}>
                    <h3>Выберите превью и оставьте комментарий</h3>

                    {/* Список превью */}
                    <div style={styles.previewList}>
                        {previews.length > 0 ? (
                            previews.map((preview) => (
                                <Card
                                    title={preview.workCategories}
                                    onClick={() => {
                                        setSelectedPreviewId(preview.id); // Устанавливаем выбранную карточку
                                        setAgreementData((prevData) => ({
                                            ...prevData,
                                            initiatorItemId: preview.id,
                                            initiatorItemName: preview.workCategories,
                                        }));
                                    }}
                                    isSelected={selectedPreviewId === preview.id} // Передаём флаг выбора
                                    key={preview.id}
                                />


                            ))
                        ) : (
                            <p>Нет доступных превью</p>
                        )}
                    </div>

                    {/* Поле комментария */}
                    <TextField
                        label="Комментарий"
                        multiline
                        rows={4}
                        fullWidth
                        value={agreementData.comment} // Привязка значения к полю comment
                        onChange={(e) =>
                            setAgreementData((prevData) => ({
                                ...prevData, // Сохраняем остальные данные
                                comment: e.target.value, // Обновляем поле comment
                            }))
                        }
                        style={{ marginTop: '20px' }}
                    />


                    {/* Кнопки */}
                    <div style={styles.buttons}>
                        <Button variant="contained" color="primary" onClick={handleSubmit}>
                            Отправить
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={onClose}>
                            Отмена
                        </Button>
                    </div>
                </div>
            </div>
        )
    );
};

export default ReactionWindow;

// Стили
const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: 'grey',
        padding: '20px',
        borderRadius: '8px',
        width: '500px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    previewList: {
        maxHeight: '200px',
        overflowY: 'auto',
        border: '1px solid #ddd',
        marginBottom: '20px',
        padding: '10px',
    },
    buttons: {
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'space-between',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '16px',
        position: 'absolute',
        top: '10px',
        right: '10px',
        cursor: 'pointer',
    },
};