import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography } from '@mui/material';
import { FaFileWord, FaFileExcel, FaFilePdf, FaFileAlt, FaEdit, FaSave, FaMinus } from 'react-icons/fa';
const DocumentStorageModalWnd = ({ isOpen, onClose, agreementId, stage }) => {
    const authToken = localStorage.getItem('authToken');
    const url = localStorage.getItem('url');
    const [isDocsReady, setIsDocsReady] = useState({ areStageFilesPresent: [] });

    const [isContractReady, setIsContractReady] = useState();
    const [isActReady, setIsActReady] = useState();
    const [isEstimateReady, setIsEstimateReady] = useState();


    const handleDownload = (type) => {
        const params = new URLSearchParams({ agreementId, type, order: stage.order });
        fetch(`${url}/document?${params.toString()}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${authToken}`,
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
                link.download = type === 'contract' ? ('Договор.docx') : (type === 'estimate' ? 'Смета.xlsx' : 'Акт.docx');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(fileURL);
            })
            .catch((error) => {
                console.error(`Ошибка при загрузке файла: ${error.message}`);
            });
    };
    useEffect(() => {
        if (isOpen) {
            const params = new URLSearchParams({ agreementId });
            fetch(`${url}/document/stage/presence?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Ошибка при получении информации по документам: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    // console.log(data);
                    setIsDocsReady(data);
                })
                .catch((error) => {
                    console.error(`Ошибка при получении информации по документам: ${error.message}`);
                });
        }
    }, [isOpen, agreementId, authToken, url]);
    useEffect(() => {

        const contractReady = checkContractPresence(isDocsReady, stage);
        setIsContractReady(contractReady);
        // console.log(contractReady)
        const actReady = checkActPresence(isDocsReady, stage);
        setIsActReady(actReady);

        const estimateReady = checkEstimatePresence(isDocsReady, stage);
        setIsEstimateReady(estimateReady);

    }, [isDocsReady, stage]);
    const checkEstimatePresence = (isDocsReady, stage) => {
        const stageFile = isDocsReady.areStageFilesPresent.find(
            (file) => file.order === stage.order
        );
        return stageFile ? stageFile.isEstimatePresent : false;
    };
    const checkActPresence = (isDocsReady, stage) => {
        const stageFile = isDocsReady.areStageFilesPresent.find(
            (file) => file.order === stage.order
        );
        return stageFile ? stageFile.isActPresent : false;
    };
    const checkContractPresence = (isDocsReady, stage) => {
        const stageFile = isDocsReady.areStageFilesPresent.find(
            (file) => file.order === stage.order
        );
        return stageFile ? stageFile.isContractPresent : false;
    };
    const handleGenerateContractOrAct = async (type) => {
        try {
            const params = new URLSearchParams({ agreementId });

            // Шаг 1: Получение данных о соглашении
            const agreementResponse = await fetch(`${url}/agreement?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
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
                    Authorization: `Bearer ${authToken}`,
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
                    Authorization: `Bearer ${authToken}`,
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
                    Authorization: `Bearer ${authToken}`,
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
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (!contractorEntityResponse.ok) {
                throw new Error(`Ошибка получения данных подрядчика: ${contractorEntityResponse.status}`);
            }

            const contractorEntityData = await contractorEntityResponse.json();

            // Формируем данные для отправки
            const projectData = {
                agreementId,
                workCategories: stage.name || stage.stageTitle,
                address: announcementData.announcementInfo.address,
                startDate: stage.startDate,
                finishDate: stage.finishDate,
                totalPrice: stage.totalPrice,
                guarantee: announcementData.announcementInfo.guarantee,
                stageOrder: stage.stageOrder
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

            if (type === "estimate") {
                // console.log(stage)
                const response = await fetch(`${url}/categories/estimate-stages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({ subStages: stage.children }),
                });
                // alert(`${type === 'contract' ? 'Договор' : 'Акт'} успешно сформирован`);

                if (!response.ok) {
                    throw new Error(`Ошибка формирования ${type === 'contract' ? 'договора' : 'акта'}: ${response.status}`);
                }

                const estimateResponse = await response.json();
                // console.log('estimate', estimateResponse.estimate)
                // console.log(stage)

                const responseEstimate = await fetch(`${url}/document/estimate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({ estimate: estimateResponse.estimate, agreementId, firstId: initiatorId, secondId: receiverId, stageOrder: stage.stageOrder }),
                });

                if (!responseEstimate.ok) {
                    throw new Error(`Ошибка сохранения сметы: ${response.status}`);
                }

            } else {
                // Шаг 7: Отправка данных на сервер для формирования
                const endpoint = type === 'contract' ? `${url}/document/contract` : `${url}/document/act`;
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({ project: projectData, contractor: contractorData, customer: customerData, firstId, secondId }),
                });
                showToast(`${type === 'contract' ? 'Договор' : 'Акт'} успешно сформирован`, 'success');

                if (!response.ok) {
                    throw new Error(`Ошибка формирования ${type === 'contract' ? 'договора' : 'акта'}: ${response.status}`);
                }

            }
            // setTrigger(prev => !prev);
        } catch (error) {
            console.error(`Ошибка при формировании ${type}:`, error.message);
        }
    };

    return (
        <Modal open={isOpen} onClose={onClose} aria-labelledby="modal-title" aria-describedby="modal-description">
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                    minWidth: 300,
                }}
            >
                {/* Заголовок */}
                <Typography id="modal-title" variant="h6" component="h2">
                    Хранилище документов
                </Typography>

                <Box sx={{ mt: 2 }}>

                    {/* <button onClick={() => {
                        console.log("Все доки", isDocsReady)
                        console.log('договор', isContractReady)
                        console.log('смета', isEstimateReady)
                        console.log('акт', isActReady)
                    }}>Проверка</ button > */}

                    {!(isContractReady || isEstimateReady || isActReady) ? <div> Хранилище пустое, так как вы еще не сформировали документы</div> : null}


                    {isContractReady ? (
                        <div
                            className='mb-3'
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
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
                                    <FaFileWord size={24} color="#4caf50" />
                                    <h4 style={{ marginLeft: '10px', marginBottom: '0', color: 'white' }}>
                                        Договор
                                    </h4>
                                </div>
                                <button
                                    onClick={() => handleDownload('contract')}
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
                            </div>
                            <button
                                onClick={() => handleGenerateContractOrAct('contract')}
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
                        </div>
                    ) : (
                        null
                    )}

                    {isEstimateReady ? (
                        <div
                            className='mb-3'

                            style={{
                                display: 'flex',
                                flexDirection: 'column',
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
                                    <FaFileExcel size={24} color="#4caf50" />
                                    <h4 style={{ marginLeft: '10px', marginBottom: '0', color: 'white' }}>
                                        Смета
                                    </h4>
                                </div>
                                <button
                                    onClick={() => handleDownload('estimate')}
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
                            </div>
                            <button
                                onClick={() => handleGenerateContractOrAct('estimate')}
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
                        </div>
                    ) : (
                        null
                    )}


                    {isActReady ? (
                        <div
                            className='mb-3'

                            style={{
                                display: 'flex',
                                flexDirection: 'column',
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
                                    <FaFileWord size={24} color="#4caf50" />
                                    <h4 style={{ marginLeft: '10px', marginBottom: '0', color: 'white' }}>
                                        Акт
                                    </h4>
                                </div>
                                <button
                                    onClick={() => handleDownload('act')}
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
                            </div>
                            <button
                                onClick={() => handleGenerateContractOrAct('act')}
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
                        </div>
                    ) : (
                        null
                    )}












                </Box>
            </Box>
        </Modal>
    );
};

export default DocumentStorageModalWnd;