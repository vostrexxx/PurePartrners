import React, {useEffect, useState} from 'react';
import {Button, TextField, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel} from '@mui/material';
import {useProfile} from '../../Context/ProfileContext';
import Card from '../../Previews/Card';
import {useNavigate, useLocation} from 'react-router-dom';
import {useToast} from '../../Notification/ToastContext'
import entity from "../../Previews/Entity.jsx";

const ReactionWindow = ({isOpen, onClose, userId, id, mode, receiverItemName, receiverEntityId}) => {
    const showToast = useToast();
    const [selectedPreviewId, setSelectedPreviewId] = useState(null); // Выбранное превью
    const [announcements, setAnnouncements] = useState([]);
    const [questionnaires, setQuestionnaires] = useState([]);
    const [previews, setPreviews] = useState([]);
    const {isSpecialist} = useProfile();
    const getAuthToken = () => localStorage.getItem('authToken');
    const url = localStorage.getItem('url');
    const navigate = useNavigate();
    // const [initItemId, setInitItemId] = useState(null);
    const [initItemId, setInitItemId] = useState(null); // <-- Сделайте это состоянием

    const [agreementData, setAgreementData] = useState({
        receiverId: userId,
        receiverItemId: id,
        mode: mode,
        initiatorItemId: null,
        comment: "",
        receiverItemName: receiverItemName,
        receiverEntityId: receiverEntityId
    });

    // useEffect(() => {
    //     console.log("receiverEntityId", receiverEntityId)
    // }, [receiverEntityId]);

    useEffect(() => {

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
                    const params = new URLSearchParams({isInWork: true});
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
                showToast("Ошибка при загрузке данных", "danger");
            }
        };

        fetchData();


    }, [isSpecialist]);


    const handleSubmit = async () => {
        if (!selectedPreviewId) {
            let word = mode === 0 ? 'вашу анкету, с которой' : 'ваше объявление, с которым';
            showToast(`Вы не выбрали ${word} хотите откликнуться`, 'danger')
            return
        }
        if (!initItemId) {
            let word = mode === 0 ? 'вашей анкете' : 'вашему объявлению';
            showToast(`Для отклика необходимо привязать лицо к ${word}`, 'danger')
            return
        }
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
                showToast("Отклик успешно отправлен", "success");
                // onClose(); // Закрываем окно
            } else {
                throw new Error(`Ошибка сети: ${contractorResponse.status}`);
            }

        } catch (error) {
            showToast("Ошибка отправки отклика", "danger");
        }
    };

    return (
        isOpen && (
            <div style={styles.overlay}>
                <div style={styles.modal}>
                    <h5 className='text-black text-center'>Выберите {isSpecialist ? "вашу анкету" : "ваше объявление"} и
                        оставьте комментарий</h5>

                    {/*<button onClick={*/}
                    {/*    (e)=>{*/}
                    {/*        e.preventDefault();*/}
                    {/*        console.log(agreementData.receiverEntityId)*/}
                    {/*    }*/}
                    {/*}>TST</button>*/}

                    <div style={styles.previewList}>
                        {previews.length > 0 ? (
                            previews.map((preview) => (
                                <Card
                                    title={preview.workCategories}
                                    onClick={() => {
                                        setSelectedPreviewId(preview.id);
                                        setInitItemId(preview.entityId)
                                        setAgreementData((prevData) => ({
                                            ...prevData,
                                            initiatorItemId: preview.id,
                                            initiatorItemName: preview.workCategories,
                                            initiatorEntityId: preview.entityId,
                                        }));
                                        console.log(preview.entityId)
                                    }}
                                    isSelected={selectedPreviewId === preview.id} // Передаём флаг выбора
                                    key={preview.id}
                                    type={isSpecialist ? "questionnaire" : "announcement"}
                                    totalCost={preview.totalCost}
                                    address={preview.address}
                                    hasEdu={preview.hasEdu}
                                    hasTeam={preview.hasTeam}
                                    workExp={preview.workExp}

                                />


                            ))
                        ) : (
                            <p>Нет доступных превью</p>
                        )}
                    </div>

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
                        style={{marginTop: '20px'}}
                    />


                    {/* Кнопки */}
                    <div style={styles.buttons}>
                        <Button variant="outlined" color="success" onClick={handleSubmit}>
                            Сохранить
                        </Button>
                        <Button variant="outlined" color="error" onClick={onClose}>
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
        backgroundColor: 'white',
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
        padding: '5px',
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