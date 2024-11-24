import React, { useState, useEffect } from 'react';
import Card from '../Previews/Card';
import { useNavigate } from 'react-router-dom';

const Agreement = ({ mode, initiatorItemId, receiverItemId, comment, status }) => {
    const [questionnaireId, setQuestionnaireId] = useState(null);
    const [announcementId, setAnnouncementId] = useState(null);

    const [questionnaireData, setQuestionnaireData] = useState(null);
    const [announcementData, setAnnouncementData] = useState(null);

    const url = localStorage.getItem('url');
    const getAuthToken = () => localStorage.getItem('authToken');
    const navigate = useNavigate();

    useEffect(() => {
        // Определяем, что является `questionnaire` и `announcement`
        if (mode) {
            setAnnouncementId(initiatorItemId);
            setQuestionnaireId(receiverItemId);
        } else {
            setAnnouncementId(receiverItemId);
            setQuestionnaireId(initiatorItemId);
        }
    }, [mode, initiatorItemId, receiverItemId]);

    useEffect(() => {
        const fetchData = async (id, type) => {
            if (!id) return;

            try {
                const params = new URLSearchParams();
                if (type === 'questionnaire') {
                    params.append('questionnaireId', id);
                } else {
                    params.append('announcementId', id);
                }

                const endpoint = type === 'questionnaire' ? 'questionnaire/preview' : 'announcement/preview';

                const response = await fetch(`${url}/${endpoint}?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (type === 'questionnaire') {
                        setQuestionnaireData(data);
                    } else {
                        setAnnouncementData(data);
                    }
                } else {
                    console.error(`Ошибка при загрузке данных (${type}):`, response.status);
                }
            } catch (error) {
                console.error(`Ошибка при выполнении запроса (${type}):`, error);
            }
        };

        fetchData(questionnaireId, 'questionnaire');
        fetchData(announcementId, 'announcement');
    }, [questionnaireId, announcementId]);

    const renderCard = (data, type) => {
        if (!data) return <p>Данные не загружены</p>;
        console.log(data)
        return (
            <Card
                title={type === 'questionnaire' ? data.categoriesOfWork : data.workCategories}
                description={data.description || 'Описание отсутствует'}
                date={data.date || 'Дата отсутствует'}
                onClick={() => navigate(`/${type}/${data.id}`, { state: { fromLk: null } })}
            />
        );
    };

    return (
        <div style={styles.agreement}>
            {mode ? (
                <div>
                    <h4>Анкета:</h4>
                    {renderCard(questionnaireData, 'questionnaire')}

                    <h4>Объявление:</h4>
                    {renderCard(announcementData, 'announcement')}

                    <h4>Комментарий откликнувшегося:</h4>
                    <p>{comment}</p>

                    <h2>{status}</h2>
                </div>
            ) : (
                <div>
                    <h4>Объявление:</h4>
                    {renderCard(announcementData, 'announcement')}

                    <h4>Анкета:</h4>
                    {renderCard(questionnaireData, 'questionnaire')}

                    <h4>Комментарий откликнувшегося:</h4>
                    <p>{comment}</p>

                    <h2>{status}</h2>
                </div>
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
