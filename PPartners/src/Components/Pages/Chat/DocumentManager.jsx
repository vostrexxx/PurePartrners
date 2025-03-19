import React, { useEffect, useState } from 'react';
import { FaFileWord, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { useToast } from '../../Notification/ToastContext'
const getAuthToken = () => localStorage.getItem('authToken');
let url = localStorage.getItem('url');
const DocumentManager = ({ agreementId, firstId, secondId }) => {
    const showToast = useToast();

    const [isContractReady, setIsContractReady] = useState(false);
    const [isEstimateReady, setIsEstimateReady] = useState(false);
    const [isActReady, setIsActReady] = useState(false);
    // const [estimateData, setEstimateData] = useState({});
    const [trigger, setTrigger] = useState(false)
    // Проверка состояния документов

    // useEffect(() => {console.log( 'айдишники',firstId, secondId)},[ firstId, secondId])

    useEffect(() => {
        const params = new URLSearchParams({ agreementId });
        fetch(`${url}/document/presence?${params.toString()}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Ошибка при получении информации по документам: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                setIsContractReady(data.isContractExists);
                setIsEstimateReady(data.isEstimateExists);
                setIsActReady(data.isActExists);
            })
            .catch((error) => {
                console.error(`Ошибка при получении информации по документам: ${error.message}`);
            });
    }, [agreementId, trigger]);

    // Скачивание документов
    const handleDownload = (type) => {
        const params = new URLSearchParams({ agreementId, type });
        fetch(`${url}/document?${params.toString()}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Ошибка при загрузке файла: ${response.status}`);
                }
                return response.blob();
            })
            .then((blob) => {
                const fileURL = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = fileURL;
                link.download =
                    type === 'contract'
                        ? 'Договор.docx'
                        : type === 'estimate'
                            ? 'Смета.xlsx'
                            : 'Акт.docx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(fileURL);
            })
            .catch((error) => {
                console.error(`Ошибка при загрузке файла: ${error.message}`);
            });
    };

    // Формирование договора или акта
    const handleGenerateContractOrAct = async (type) => {
        try {
            const params = new URLSearchParams({ agreementId });

            // Шаг 1: Получение данных о соглашении
            const agreementResponse = await fetch(`${url}/agreement?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            });

            if (!agreementResponse.ok) {
                throw new Error(`Ошибка получения соглашения: ${agreementResponse.status}`);
            }

            const agreementData = await agreementResponse.json();
            const { mode, initiatorId, initiatorItemId, receiverId, receiverItemId } = agreementData.agreementInfo;

            // Определяем заказчика и подрядчика
            const customerId = mode === 1 ? initiatorId : receiverId;
            const customerItemId = mode === 1 ? initiatorItemId : receiverItemId;
            const contractorId = mode === 1 ? receiverId : initiatorId;
            const contractorItemId = mode === 1 ? receiverItemId : initiatorItemId;

            // Шаг 2: Получение данных о заказчике (объявление)
            const announcementResponse = await fetch(`${url}/announcement?announcementId=${customerItemId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            });

            if (!announcementResponse.ok) {
                throw new Error(`Ошибка получения объявления: ${announcementResponse.status}`);
            }

            const announcementData = await announcementResponse.json();

            // Шаг 3: Получение данных о подрядчике (анкета)
            const questionnaireResponse = await fetch(`${url}/questionnaire?questionnaireId=${contractorItemId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            });

            if (!questionnaireResponse.ok) {
                throw new Error(`Ошибка получения анкеты: ${questionnaireResponse.status}`);
            }

            const questionnaireData = await questionnaireResponse.json();

            // Шаг 4: Получение данных о заказчике (Entity)
            const customerEntityResponse = await fetch(`${url}/customer?customerId=${announcementData.announcementInfo.entityId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            });

            if (!customerEntityResponse.ok) {
                throw new Error(`Ошибка получения данных заказчика: ${customerEntityResponse.status}`);
            }

            const customerEntityData = await customerEntityResponse.json();

            // Шаг 5: Получение данных о подрядчике (Entity)
            const contractorEntityResponse = await fetch(`${url}/contractor?contractorId=${questionnaireData.questionnaireInfo.entityId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            });

            if (!contractorEntityResponse.ok) {
                throw new Error(`Ошибка получения данных подрядчика: ${contractorEntityResponse.status}`);
            }

            const contractorEntityData = await contractorEntityResponse.json();

            // Шаг 6: Получение общей стоимости проекта
            const priceResponse = await fetch(`${url}/document/estimate-total-price?agreementId=${agreementId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            });

            if (!priceResponse.ok) {
                throw new Error(`Ошибка получения общей стоимости: ${priceResponse.status}`);
            }

            const priceData = await priceResponse.json();

            // Формируем данные для отправки
            const projectData = {
                agreementId,
                workCategories: announcementData.announcementInfo.workCategories,
                address: announcementData.announcementInfo.address,
                startDate: announcementData.announcementInfo.startDate,
                finishDate: announcementData.announcementInfo.finishDate,
                totalPrice: priceData.totalPrice,
                guarantee: announcementData.announcementInfo.guarantee,
            };

            const contractorData = {
                isLegalEntity: contractorEntityData.isLegalEntity,
                fullName: contractorEntityData.fullName,
                firm: contractorEntityData.firm,
                position: contractorEntityData.position,
                address: contractorEntityData.address,
                inn: contractorEntityData.inn,
                kpp: contractorEntityData.kpp,
                corrAcc: contractorEntityData.corrAcc,
                currAcc: contractorEntityData.currAcc,
                bik: contractorEntityData.bik,
                bank: contractorEntityData.bank,
                account: contractorEntityData.account
            };

            const customerData = {
                isLegalEntity: customerEntityData.isLegalEntity,
                fullName: customerEntityData.fullName,
                firm: customerEntityData.firm,
                position: customerEntityData.position,
                address: customerEntityData.address,
                inn: customerEntityData.inn,
                kpp: customerEntityData.kpp,
                corrAcc: customerEntityData.corrAcc,
                currAcc: customerEntityData.currAcc,
                bik: customerEntityData.bik,
                bank: customerEntityData.bank,
            };

            // Шаг 7: Отправка данных на сервер для формирования
            const endpoint = type === 'contract' ? `${url}/document/contract` : `${url}/document/act`;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify({ project: projectData, contractor: contractorData, customer: customerData }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка формирования ${type === 'contract' ? 'договора' : 'акта'}: ${response.status}`);
            }

            showToast(`${type === 'contract' ? 'Договор' : 'Акт'} успешно сформирован`, 'success');
            setTrigger(!trigger)
        } catch (error) {
            console.error(`Ошибка при формировании ${type}:`, error.message);
        }
    };

    // Формирование сметы
    const handleGenerateEstimate = async () => {
        try {
            const params = new URLSearchParams({ agreementId });
            const response = await fetch(`${url}/categories/estimate?${params.toString()}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка получения сметы: ${response.status}`);
            }

            const data = await response.json();
            // setEstimateData(estimate);

            // console.log(estimate.estimate)

            const generateResponse = await fetch(`${url}/document/estimate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify({ estimate: data.estimate, agreementId, firstId, secondId }),
            });

            if (!generateResponse.ok) {
                throw new Error(`Ошибка формирования сметы: ${generateResponse.status}`);
            }

            showToast('Смета успешно сформирована', 'success');
            setTrigger(!trigger)

        } catch (error) {
            console.error('Ошибка при формировании сметы:', error.message);
        }
    };

    return (
        <div
            style={{
                backgroundColor: '#1a1a1a',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                margin: '20px auto',
                maxWidth: '500px',
                color: 'white',
            }}
        >
            <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Управление документами</h3>

            {[
                // { label: 'Договор', isReady: isContractReady, type: 'contract', icon: <FaFileWord size={24} /> },
                { label: 'Смета', isReady: isEstimateReady, type: 'estimate', icon: <FaFileExcel size={24} /> },
                // { label: 'Акт', isReady: isActReady, type: 'act', icon: <FaFilePdf size={24} /> },
            ].map((doc) => (
                <div
                    key={doc.type}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        marginBottom: '15px',
                        padding: '10px',
                        borderRadius: '8px',
                        backgroundColor: '#2a2a2a',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {React.cloneElement(doc.icon, {
                                color: doc.isReady ? '#4caf50' : '#f44336',
                            })}
                            <h4 style={{ marginLeft: '10px', marginBottom: '0' }}>{doc.label}</h4>
                        </div>
                        {doc.isReady ? (
                            <button
                                onClick={() => handleDownload(doc.type)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#4caf50',
                                    fontSize: '16px',
                                }}
                            >
                                Скачать
                            </button>
                        ) : (
                            <button
                                onClick={
                                    doc.type === 'estimate'
                                        ? handleGenerateEstimate
                                        : () => handleGenerateContractOrAct(doc.type)
                                }
                                style={{
                                    backgroundColor: '#f44336',
                                    border: 'none',
                                    color: 'white',
                                    padding: '5px 10px',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                }}
                            >
                                Сформировать
                            </button>
                        )}
                    </div>
                    {doc.isReady && (
                        <button
                            onClick={
                                doc.type === 'estimate'
                                    ? handleGenerateEstimate
                                    : () => handleGenerateContractOrAct(doc.type)
                            }
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#ffa500',
                                cursor: 'pointer',
                                fontSize: '14px',
                                marginTop: '8px',
                                textAlign: 'right',
                                textDecoration: 'underline',
                            }}
                        >
                            Переформировать
                        </button>
                    )}
                </div>
            ))}
        </div>
    );

};

export default DocumentManager;
