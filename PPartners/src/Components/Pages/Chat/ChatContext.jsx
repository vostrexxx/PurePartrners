import React, { useState, useEffect } from 'react';
import Card from '../../Previews/Card'; // Убедитесь, что компонент Card импортирован корректно
import { useNavigate } from 'react-router-dom';

const ChatContext = ({ agreementId }) => {
    const [agreementInfo, setAgreementInfo] = useState(null);
    const [userId, setUserId] = useState(null);
    const [mode, setMode] = useState(null);
    const [questionnaireData, setQuestionnaireData] = useState(null);
    const [announcementData, setAnnouncementData] = useState(null);

    const url = localStorage.getItem('url');
    const getAuthToken = () => localStorage.getItem('authToken');
    const navigate = useNavigate();

    useEffect(() => {
        console.log('Agreement ID in ChatContext:', agreementId);

        // Проверка наличия `agreementId`
        if (!agreementId) {
            console.error('Agreement ID is missing');
            return;
        }

        const fetchAgreementInfo = async () => {
            try {
                const params = new URLSearchParams({ agreementId });
                const response = await fetch(`${url}/agreement?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка получения данных по соглашению: ${response.status}`);
                }

                const data = await response.json();
                setAgreementInfo(data.agreementInfo);
                setUserId(data.userId);
                setMode(data.agreementInfo.mode);

                // Определяем, что является `questionnaire` и `announcement`
                if (data.agreementInfo.mode) {
                    fetchPreviewData(data.agreementInfo.receiverItemId, 'questionnaire');
                    fetchPreviewData(data.agreementInfo.initiatorItemId, 'announcement');
                } else {
                    fetchPreviewData(data.agreementInfo.initiatorItemId, 'questionnaire');
                    fetchPreviewData(data.agreementInfo.receiverItemId, 'announcement');
                }
            } catch (error) {
                console.error(`Ошибка: ${error.message}`);
            }
        };

        fetchAgreementInfo();
    }, [agreementId]);

    const fetchPreviewData = async (id, type) => {
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

    const renderCard = (data, type) => {
        if (!data) return <p>Данные не загружены</p>;
    
        const isUserItem =
            (type === 'questionnaire' && agreementInfo?.receiverItemId === data.id && mode) ||
            (type === 'announcement' && agreementInfo?.initiatorItemId === data.id && !mode);
    
        const title = type === 'questionnaire' ? data.categoriesOfWork : data.workCategories;
    
        return (
            <Card
                title={`${title} ${isUserItem ? '(Ваше)' : ''}`}
                // description={data.description || 'Описание отсутствует'}
                // date={data.date || 'Дата отсутствует'}
                onClick={() => navigate(`/${type}/${data.id}`, { state: { fromLk: null } })}
            />
        );
    };
    

    return (
        <div style={styles.card}>
            {mode !== null ? (
                <div>
                    <h4>Анкета:</h4>
                    {renderCard(questionnaireData, 'questionnaire')}

                    <h4>Объявление:</h4>
                    {renderCard(announcementData, 'announcement')}
                </div>
            ) : (
                <p>Загрузка данных...</p>
            )}
        </div>
    );
};

const styles = {
    card: {
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

export default ChatContext;
