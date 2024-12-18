import React, { useState, useEffect } from 'react';
import Card from '../Previews/Card';
import { useNavigate } from 'react-router-dom';

const Agreement = ({ id, mode, initiatorItemId, receiverItemId, comment, localizedStatus, isReceiver, initiatorId , receiverId, chatId, isSpecialist }) => {
    const [questionnaireId, setQuestionnaireId] = useState(null);
    const [announcementId, setAnnouncementId] = useState(null);

    const [questionnaireData, setQuestionnaireData] = useState(null);
    const [announcementData, setAnnouncementData] = useState(null);

    const [isChatExists, setIsChatExists] = useState(null);
    const [isConversation, setIsConversation] = useState(localizedStatus === 'Переговоры' ? true : false);
    const [isRejected, setIsRejected] = useState(localizedStatus === 'Отклонено' ? true : false);

    const url = localStorage.getItem('url');
    const getAuthToken = () => localStorage.getItem('authToken');
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams({
            chatId: chatId,
        });
    
        fetch(`${url}/chat/exists?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Ошибка при проверке существования чата: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            setIsChatExists(data.isChatExists);
            console.log("Обновлено isChatExists:", data.isChatExists);
        })
        .catch((error) => {
            console.error("Ошибка:", error);
        });
    }, [chatId]);
    

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
                    console.log("data", data)

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
                title={type === 'questionnaire' ? data.workCategories : data.workCategories}
                description={data.description || 'Описание отсутствует'}
                date={data.date || 'Дата отсутствует'}
                onClick={() => navigate(`/${type}/${data.id}`, { state: { fromLk: null } })}
            />
        );
    };

    const handleReject = async () => {
        // console.log(questionnaireData)
        const bodyData = {
            newStatus: "Отклонено",
            agreementId: id,
        };
        try {
            const response = await fetch(`${url}/agreement`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify(bodyData),
            });

            if (!response.ok) {
                throw new Error(`Ошибка при отклонении: ${response.status}`);
            }

            const data = await response.json();
            if (data.success === 1) {
                // setIsEditable(false);
            } else {
                // setError('Не удалось отклонить соглашение');
            }
        } catch (error) {
            // setError(`Ошибка при отклонении: ${error.message}`);
        }
    };

    const handleStartChat = async () => {
        let initiatorChatName = '';
        let receiverChatName = '';
    
        if (mode === 1) {
            // Инициатор — анкета, получатель — объявление
            initiatorChatName = questionnaireData?.workCategories || 'Неизвестно';
            receiverChatName = announcementData?.workCategories || 'Неизвестно';
        } else if (mode === 0) {
            // Инициатор — объявление, получатель — анкета
            initiatorChatName = announcementData?.workCategories || 'Неизвестно';
            receiverChatName = questionnaireData?.workCategories || 'Неизвестно';
        }
    
        const bodyData = {
            chatInitiatorId: initiatorId,
            chatReceiverId: receiverId,
            chatId: chatId,
            chatInitiatorName: initiatorChatName,
            chatReceiverName: receiverChatName,
            isSpecialist: isSpecialist,
            agreementId: id,
        };
    
        fetch(`${url}/event/new-chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`,
            },
            body: JSON.stringify(bodyData),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Ошибка при открытии чата: ${response.status}`);
                }
                return response.json();
            })
            .then(() => {
                const bodyData = {
                    newStatus: 'Переговоры',
                    agreementId: id,
                };
                fetch(`${url}/agreement`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}`,
                    },
                    body: JSON.stringify(bodyData),
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error(`Ошибка при обновлении соглашения: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then((data) => {
                        console.log('Успешный ответ:', data);
                    })
                    .catch((error) => {
                        console.error('Ошибка:', error.message);
                    });
            })
            .catch((error) => {
                console.error('Ошибка:', error.message);
            });
    };
    
    const handleOpenChat = () => {
        const params = new URLSearchParams({
            chatId,
        });
    
        fetch(`${url}/chat/info?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Ошибка при получении информации по соглашению: ${response.status}`);
                }
                return response.json();
            })
            .then((response) => {
                // console.log('агримант', agreementId);
                navigate(`/chat/${chatId}`, { state: { agreementId: response.agreementId } });
            })
            .catch((error) => {
                console.log(`Ошибка при получении информации по соглашению: ${error.message}`);
            });
    };
    

    // { r ? (
    //     <div>
    //         <button onClick={handleReject} style={styles.button}>
    //                 Отклонить
    //         </button>
    //         {isChatExists ? 
    //             (<button onClick={handleOpenChat} style={styles.button}>Открыть чат</button>)
    //             :
    //             (<button onClick={handleStartChat} style={styles.button}>Создать чат</button>)
    //         }
            
    //     </div>
    // ) : (
    //     !isRejected && isConversation && isChatExists ? (<button onClick={handleOpenChat} style={styles.button}>Открыть чат</button>) : null
    // )}

    
    let bottomEl;

    if (!isRejected) {
        if (isReceiver) {
            bottomEl = (
                <div>
                    <button onClick={handleReject} style={styles.button}>Отклонить</button>
                    {isChatExists ? 
                        <button onClick={handleOpenChat} style={styles.button}>Открыть чат</button>
                        :
                        <button onClick={handleStartChat} style={styles.button}>Создать чат</button>
                    }
                </div>)
        } else if (!isReceiver && isChatExists){
            bottomEl = (
                <div>
                    <button onClick={handleOpenChat} style={styles.button}>Открыть чат</button>
                </div>)
        }  
    } else {
        bottomEl = null
    }


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

                    <h2>{localizedStatus}</h2>
                </div>
            ) : (
                <div>
                    <h4>Объявление:</h4>
                    {renderCard(announcementData, 'announcement')}

                        <h4>Анкета:</h4>
                    {renderCard(questionnaireData, 'questionnaire')}

                    <h4>Комментарий откликнувшегося:</h4>
                    <p>{comment}</p>

                    <h2>{localizedStatus}</h2>
                </div>
            )}
                <div>{bottomEl}</div>

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
