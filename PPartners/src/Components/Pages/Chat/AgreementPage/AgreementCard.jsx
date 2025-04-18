import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Dropdown } from "react-bootstrap";
import Card from '../../../Previews/Card';
import { useProfile } from '../../../Context/ProfileContext';

const AgreementCard = ({ agreementId, onClick }) => {

    // const showToast = useToast();
    const [agreementInfo, setAgreementInfo] = useState(null);
    const [userId, setUserId] = useState(null);
    const [mode, setMode] = useState(null);
    const [questionnaireData, setQuestionnaireData] = useState(null);
    const [announcementData, setAnnouncementData] = useState(null);

    const { isSpecialist } = useProfile();
    const who = isSpecialist ? 'contractor' : 'customer';

    const url = localStorage.getItem('url');
    const getAuthToken = () => localStorage.getItem('authToken');

    const [triggerAgreement, setTriggerAgreement] = useState(false);


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
    return (
        <div style={styles.card} onClick={onClick} className='mb-3'>
            {/* <div className="card"> */}
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
            {/* </div> */}


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

                </div>
            ) : (
                <div>Загрузка...</div>
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
        // margin: '16px 0',
        cursor: 'pointer',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    lastMessageTime: {
        fontSize: '6'
    }
};





export default AgreementCard;






