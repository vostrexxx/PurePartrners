import React, { useState, useEffect, useRef } from 'react';
import Card from '../../Previews/Card'; // Убедитесь, что компонент Card импортирован корректно
import { useNavigate } from 'react-router-dom';
import { EventSourcePolyfill } from 'event-source-polyfill';
import RejectButton from './RejectButton';
import CompleteButton from './CompleteButton';
import { useProfile } from '../../Context/ProfileContext';
import { Button } from 'react-bootstrap'; // Используем Button из Bootstrap
import { useToast } from '../../Notification/ToastContext'
const ChatContext = ({ agreementId }) => {
    const showToast = useToast();
    const [agreementInfo, setAgreementInfo] = useState(null);
    const [userId, setUserId] = useState(null);
    const [mode, setMode] = useState(null);
    const [questionnaireData, setQuestionnaireData] = useState(null);
    const [announcementData, setAnnouncementData] = useState(null);

    const { isSpecialist } = useProfile();
    const who = isSpecialist ? 'contractor' : 'customer';

    const url = localStorage.getItem('url');
    const getAuthToken = () => localStorage.getItem('authToken');
    const navigate = useNavigate();

    const [triggerAgreement, setTriggerAgreement] = useState(false);
    const eventQueue = useRef([]);
    const isProcessingQueue = useRef(false);

    useEffect(() => {
        const processEventQueue = () => {
            if (eventQueue.current.length > 0 && !isProcessingQueue.current) {
                isProcessingQueue.current = true;
                const event = eventQueue.current.shift();

                console.log("Обрабатывается событие:", event);

                if (event === 'triggerAgreement') {
                    setTriggerAgreement((prev) => !prev);
                }

                setTimeout(() => {
                    isProcessingQueue.current = false;
                    processEventQueue();
                }, 1000);
            }
        };

        const eventSource = new EventSourcePolyfill(`${url}/agreement/events/${agreementId}`, {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
            },
        });

        eventSource.onopen = () => {
            console.log("1 - SSE соединение ДЛЯ СОГЛАШЕНИЯ установлено");
        };

        eventSource.onmessage = (event) => {
            if (event.data.trim() === ':ping') {
                return;
            }

            console.log("SSE msg: event.data - ", event.data);
            eventQueue.current.push(event.data);
            processEventQueue();
        };

        eventSource.onerror = (error) => {
            console.error("Ошибка SSE:", error);
            eventSource.close();
        };

        return () => {
            console.log("0 - SSE соединение ДЛЯ СОГЛАШЕНИЯ разорвано");
            eventSource.close();
        };
    }, [agreementId, url]);

    useEffect(() => {
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
    }, [agreementId, triggerAgreement]);

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

        const title = type === 'questionnaire' ? data.workCategories : data.workCategories;

        return (
            <Card
                title={title}
                isSpecialist={isSpecialist}
                onClick={() => navigate(`/${type}/${data.id}`, { state: { fromLk: null } })}
                totalCost={data.totalCost}
                address={data.address}
                workExp={data.workExp}
                hasTeam={data.hasTeam}
                hasEdu={data.hasEdu}
                type={type}
            />
        );
    };

    const handleComplete = async (mode, agreementId) => {
        try {
            const response = await fetch(`${url}/agreement/completion`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify({ mode, agreementId }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка сети: ${response.status}`);
            }

            const data = await response.json();
        } catch (error) {
            showToast('Ошибка при утверждении', 'danger');
        }
    };

    const isLocalCompleted = who === 'contractor'
        ? agreementInfo?.isContractorCompleted ?? false
        : agreementInfo?.isCustomerCompleted ?? false;

    const isBothCompleted = (agreementInfo?.isContractorCompleted ?? false) && (agreementInfo?.isCustomerCompleted ?? false);

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-body">
                    {mode !== null ? (
                        <div>
                            <h3 className="card-title">Статус: {agreementInfo.localizedStatus}</h3>
                            {isSpecialist ? (<h4>Ваша анкета:</h4>) : (<h4>Анкета:</h4>)}
                            {renderCard(questionnaireData, 'questionnaire')}

                            {!isSpecialist ? (<h4>Ваше объявление:</h4>) : (<h4>Обновление:</h4>)}
                            {renderCard(announcementData, 'announcement')}
                        </div>
                    ) : (
                        <p>Загрузка данных...</p>
                    )}
                </div>
            </div>

            {agreementInfo && (agreementInfo.localizedStatus === "В ожидании" || agreementInfo.localizedStatus === "Переговоры") ?
                <RejectButton className="m-3" agreementId={agreementId} /> : ""}

            {agreementInfo ? (
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <h5 className="mb-0 text-white">
                        Статус:
                        {agreementInfo.isCustomerCompleted && agreementInfo.isContractorCompleted ? (
                            ' Соглашение завершено'
                        ) : who === 'contractor' ? (
                            agreementInfo.isCustomerCompleted ?
                                ' Заказчик утвердил' :
                                ' Заказчик еще не утвердил'
                        ) : (
                            agreementInfo.isContractorCompleted ?
                                ' Подрядчик утвердил' :
                                ' Подрядчик еще не утвердил'
                        )}
                    </h5>

                    {isBothCompleted ? (
                        <Button variant="success" disabled>
                            Все работы завершены
                        </Button>
                    ) : (
                        <Button
                            variant={isLocalCompleted ? 'outline-danger' : 'outline-success'}
                            onClick={() => handleComplete(who, agreementId)}
                        >
                            {isLocalCompleted ? 'Отменить завершение' : 'Утвердить завершение'}
                        </Button>
                    )}
                </div>
            ) : (
                <div>Загрузка...</div>
            )}
        </div>
    );
};

export default ChatContext;