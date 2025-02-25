import React, { useState, useEffect } from 'react';
import { Card, Button, Container, Row, Col } from 'react-bootstrap'; // Импортируем компоненты Bootstrap
import { useNavigate } from 'react-router-dom';

const Agreement = ({
    id, mode, initiatorItemId, receiverItemId, comment, localizedStatus,
    isReceiver, initiatorId, receiverId, chatId, isSpecialist, onTrigger
}) => {
    const [questionnaireId, setQuestionnaireId] = useState(null);
    const [announcementId, setAnnouncementId] = useState(null);
    const [questionnaireData, setQuestionnaireData] = useState(null);
    const [announcementData, setAnnouncementData] = useState(null);
    const [isChatExists, setIsChatExists] = useState(null);
    const [isConversation, setIsConversation] = useState(localizedStatus === 'Переговоры');
    const [isRejected, setIsRejected] = useState(localizedStatus === 'Отклонено');

    const url = localStorage.getItem('url');
    const getAuthToken = () => localStorage.getItem('authToken');
    const navigate = useNavigate();
    const [trigger, setTrigger] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams({ chatId });

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
            })
            .catch((error) => {
                console.error("Ошибка:", error);
            });
    }, [chatId, trigger]);

    useEffect(() => {
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

        return (
            <Card className="mb-3">
                <Card.Body>
                    <Card.Title>{data.workCategories}</Card.Title>
                    <Card.Text>
                        Стоимость: {data.totalCost} руб.<br />
                        Адрес: {data.address}<br />
                        Опыт работы: {data.workExp} лет<br />
                        {data.hasTeam ? 'Имеется команда' : 'Нет команды'}<br />
                        {data.hasEdu ? 'Есть образование' : 'Нет образования'}
                    </Card.Text>
                    <Button
                        variant="primary"
                        onClick={() => navigate(`/${type}/${data.id}`, { state: { fromLk: null } })}
                    >
                        Подробнее
                    </Button>
                </Card.Body>
            </Card>
        );
    };

    const handleReject = async () => {
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
                onTrigger();
            }
        } catch (error) {
            console.error('Ошибка при отклонении:', error);
        }
    };

    const handleStartChat = async () => {
        let initiatorChatName = '';
        let receiverChatName = '';

        if (mode === 1) {
            initiatorChatName = questionnaireData?.workCategories || 'Неизвестно';
            receiverChatName = announcementData?.workCategories || 'Неизвестно';
        } else if (mode === 0) {
            initiatorChatName = announcementData?.workCategories || 'Неизвестно';
            receiverChatName = questionnaireData?.workCategories || 'Неизвестно';
        }

        const bodyData = {
            chatInitiatorId: receiverId,
            chatReceiverId: initiatorId,
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
                setTrigger(!trigger);
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
                        onTrigger();
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
        const params = new URLSearchParams({ chatId });

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
                navigate(`/chat/${chatId}`, { state: { agreementId: response.agreementId } });
            })
            .catch((error) => {
                console.error(`Ошибка при получении информации по соглашению: ${error.message}`);
            });
    };

    let bottomEl;

    if (!isRejected) {
        if (isReceiver) {
            bottomEl = (
                <div className="d-flex gap-2">
                    <Button variant="danger" onClick={handleReject}>Отклонить</Button>
                    {isChatExists ?
                        <Button variant="primary" onClick={handleOpenChat}>Открыть чат</Button>
                        :
                        <Button variant="success" onClick={handleStartChat}>Создать чат</Button>
                    }
                </div>
            );
        } else if (!isReceiver && isChatExists) {
            bottomEl = (
                <Button variant="primary" onClick={handleOpenChat}>Открыть чат</Button>
            );
        }
    } else {
        bottomEl = null;
    }

    return (
        <Container className="border rounded p-3 mb-3 bg-white">
            <Row>
                <Col>
                    {mode ? (
                        <div>
                            {isSpecialist ? <h4>Ваша анкета:</h4> : <h4>Анкета:</h4>}
                            {renderCard(questionnaireData, 'questionnaire')}

                            {!isSpecialist ? <h4>Ваше объявление:</h4> : <h4>Объяовление:</h4>}
                            {renderCard(announcementData, 'announcement')}

                            <h4>Комментарий откликнувшегося:</h4>
                            <p>{comment}</p>

                            <h2>{localizedStatus}</h2>
                        </div>
                    ) : (
                        <div>
                            {!isSpecialist ? <h4>Ваше объявление:</h4> : <h4>Объявление:</h4>}
                            {renderCard(announcementData, 'announcement')}

                            {isSpecialist ? <h4>Ваша анкета:</h4> : <h4>Анкета:</h4>}
                            {renderCard(questionnaireData, 'questionnaire')}

                            <h4>Комментарий откликнувшегося:</h4>
                            <p>{comment}</p>

                            <h2>{localizedStatus}</h2>
                        </div>
                    )}
                    <div>{bottomEl}</div>
                </Col>
            </Row>
        </Container>
    );
};

export default Agreement;