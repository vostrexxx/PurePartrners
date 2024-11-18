import React, { useState, useEffect } from 'react';

const Agreement = ({ mode, initiatorItemId, receiverId, receiverItemId, status, comment, createDate, updateDate }) => {
    const [questionnaireId, setQuestionnaireId] = useState(null);
    const [announcementId, setAnnouncementId] = useState(null);
    const [questionnaireData, setQuestionnaireData] = useState(null);
    const url = localStorage.getItem('url');
    const getAuthToken = () => localStorage.getItem('authToken');

    useEffect(() => {
        // Определяем ID для анкеты и объявления
        if (mode) {
            setAnnouncementId(initiatorItemId);
            setQuestionnaireId(receiverItemId);
        } else {
            setAnnouncementId(receiverItemId);
            setQuestionnaireId(initiatorItemId);
        }
    }, [mode, initiatorItemId, receiverItemId]);

    useEffect(() => {
        // Загружаем данные только если есть questionnaireId
        const fetchQuestionnaireData = async () => {
            if (!questionnaireId) return;

            try {
                const params = new URLSearchParams({ questionnaireId });
                const response = await fetch(`${url}/questionnaire/preview?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setQuestionnaireData(data);
                } else {
                    console.error('Ошибка при загрузке анкеты:', response.status);
                }
            } catch (error) {
                console.error('Ошибка при выполнении запроса:', error);
            }
        };

        fetchQuestionnaireData();
    }, [questionnaireId, url]); // Запрос только если изменился questionnaireId

    return (
        <div style={styles.agreement}>
            <h3>{status}</h3>
            <p>{comment}</p>
            <small>Анкета ID: {questionnaireId}</small>
            <small>Объявление ID: {announcementId}</small>

            {questionnaireData ? (
                <div>
                    <h4>Данные анкеты:</h4>
                    <p>{JSON.stringify(questionnaireData)}</p>
                </div>
            ) : (
                <p>Загрузка данных анкеты...</p>
            )}
        </div>
    );
};

const styles = {
    agreement: {
        color: 'black',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        margin: '16px 0',
        cursor: 'pointer',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
};

export default Agreement;
