import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, Button, TextField } from '@mui/material';
import { FaFileWord, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../Notification/ToastContext'

const StageModalWnd = ({ isOpen, onClose, mode, stage, agreementId, triggerStages, setTriggerStages, firstId, secondId }) => {
    if (!stage) return null; // Если stage не передан, ничего не рендерим
    const showToast = useToast();
    // console.log(stage)
    const authToken = localStorage.getItem('authToken');
    const url = localStorage.getItem('url');
    const [stageData, setStageData] = useState(stage);

    const [account, setAccount] = useState(null);

    const [isContractReady, setIsContractReady] = useState();
    const [isActReady, setIsActReady] = useState();
    const [isEstimateReady, setIsEstimateReady] = useState();

    const [trigger, setTrigger] = useState(false)

    const [isDocsReady, setIsDocsReady] = useState({ areStageFilesPresent: [] });

    const [isLoading, setIsLoading] = useState(true);

    const [balance, setBalance] = useState(null);
    const navigate = useNavigate();

    // useEffect(() => {console.log(stageData)},[stageData]);

    useEffect(() => {
        const fetchStageData = async () => {
            try {
                console.log('стэйдж', stage)
                const response = await fetch(`${url}/stages/stage?elementId=${stage.elementId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка получения этапа для модульного окна'`);
                }

                const data = await response.json();
                // console.log(data.stageStatus);
                setStageData(data)

            } catch (error) {
                console.error('Ошибка получения состояния редактирования:', error.message);
            }
        };

        fetchStageData();

    }, [triggerStages]);


    const checkContractPresence = (isDocsReady, stage) => {
        const stageFile = isDocsReady.areStageFilesPresent.find(
            (file) => file.order === stage.stageOrder
        );
        // console.log(isDocsReady, stage)

        // console.log("Найденный файл:", stageFile);
        return stageFile ? stageFile.isContractPresent : false;
    };

    useEffect(() => {
        const fetchGetBalance = async () => {
            try {
                const response = await fetch(`${url}/balance`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`Ошибка загрузки баланса: ${response.status}`);
                }

                const data = await response.json();
                // console.log(data.balance);
                setBalance(data.balance || null); // Сохраняем историю списания
            } catch (error) {
                console.error(`Не удалось загрузить баланс: ${error.message}`);
            }
        };

        fetchGetBalance();
    }, []);

    const checkActPresence = (isDocsReady, stage) => {
        const stageFile = isDocsReady.areStageFilesPresent.find(
            (file) => file.order === stage.stageOrder
        );

        return stageFile ? stageFile.isActPresent : false;
    };

    const checkEstimatePresence = (isDocsReady, stage) => {
        const stageFile = isDocsReady.areStageFilesPresent.find(
            (file) => file.order === stage.stageOrder
        );

        return stageFile ? stageFile.isEstimatePresent : false;
    };

    useEffect(() => {
        const params = new URLSearchParams({ agreementId });
        setIsLoading(true);
        fetch(`${url}/document/stage/presence?${params.toString()}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Ошибка при получении информации по документам: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                if (data && Array.isArray(data.areStageFilesPresent)) {
                    setIsDocsReady(data);
                } else {
                    setIsDocsReady({ areStageFilesPresent: [] });
                }
            })
            .catch((error) => {
                console.error(`Ошибка при получении информации по документам: ${error.message}`);
                setIsDocsReady({ areStageFilesPresent: [] });
            })
            .finally(() => {
                setIsLoading(false); // Завершение загрузки
            });
    }, [trigger]);


    const handleDownload = (type) => {
        const params = new URLSearchParams({ agreementId, type, order: stageData.stageOrder });
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
        if (!isLoading) {
            const contractReady = checkContractPresence(isDocsReady, stageData);
            setIsContractReady(contractReady);
            // console.log(contractReady)
            const actReady = checkActPresence(isDocsReady, stageData);
            setIsActReady(actReady);

            const estimateReady = checkEstimatePresence(isDocsReady, stageData);
            setIsEstimateReady(estimateReady);
        }

        console.log('data', stageData)
    }, [isLoading, isDocsReady, stageData]);


    // Формирование договора или акта
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

            console.log(announcementData)
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
                workCategories: stageData.name || stageData.stageTitle,
                address: announcementData.announcementInfo.address,
                startDate: stageData.startDate,
                finishDate: stageData.finishDate,
                totalPrice: stageData.totalPrice,
                guarantee: announcementData.announcementInfo.guarantee,
                stageOrder: stageData.stageOrder
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
                const response = await fetch(`${url}/categories/estimate-stages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({ subStages: stageData.subStages }),
                });
                // alert(`${type === 'contract' ? 'Договор' : 'Акт'} успешно сформирован`);

                if (!response.ok) {
                    throw new Error(`Ошибка формирования ${type === 'contract' ? 'договора' : 'акта'}: ${response.status}`);
                }

                const estimateResponse = await response.json();
                console.log('ответы сметана', estimateResponse.estimate)

                console.log('сметана', estimateResponse.estimate)
                console.log(stageData)

                const responseEstimate = await fetch(`${url}/document/estimate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({ estimate: estimateResponse.estimate, agreementId, firstId: initiatorId, secondId: receiverId, stageOrder: stageData.stageOrder }),
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
            setTrigger(prev => !prev);
        } catch (error) {
            console.error(`Ошибка при формировании ${type}:`, error.message);
        }
    };

    const handleTopUp = async () => {
        try {

            const params = new URLSearchParams({ agreementId });

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
            const { mode, initiatorItemId, receiverItemId } = agreementData.agreementInfo;

            const customerItemId = mode === 1 ? initiatorItemId : receiverItemId;

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


            const response = await fetch(`${url}/stages/top-up`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ balance: stageData.totalPrice, elementId: stageData.id }),
            });

            if (!response.ok) {
                throw new Error('Ошибка заморозки средств');
            }

            const data = await response.json();

            // Проверяем, пришел ли success: 1
            if (data.success === 1) {
                console.log('СТЭЙДЖ ДАТА', stageData)
                // Второй запрос
                const response_ = await fetch(`${url}/balance/payment`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({
                        stagePrice: stageData.totalPrice,
                        workCategories: announcementData.announcementInfo.workCategories,
                        address: announcementData.announcementInfo.address,
                        stageTitle: stageData.stageTitle,
                        mode: 'Заморозка средств',
                        firstId,
                        secondId
                    }),
                });

                if (!response_.ok) {
                    throw new Error(`Ошибка сети: ${response_.status}`);
                }

                const paymentData = await response_.json();

                if (paymentData.success) {
                    showToast('Деньги успешно заморожены', 'success');
                }

                handleChangeStageStatus('Не начато');
            } else {
                showToast('Не удалось выполнить заморозку средств. Проверьте данные.', 'danger');
            }
        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error.message);
        }
    };


    const handleChangeStageStatus = async (stageStatus) => {
        try {
            if (stageData.stageStatus === "Подтверждено") {
                const params = new URLSearchParams({ agreementId });

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
                const { mode, initiatorItemId, receiverItemId } = agreementData.agreementInfo;

                const customerItemId = mode === 1 ? initiatorItemId : receiverItemId;

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
                // console.log(announcementData)
                const response = await fetch(`${url}/balance/payment`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({
                        stagePrice: stageData.totalPrice, workCategories: announcementData.announcementInfo.workCategories,
                        address: announcementData.announcementInfo.address, stageTitle: stageData.name, mode: 'Списание замороженных средств',
                        firstId, secondId
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status}`);
                }
                const data = await response.json();
                if (data.success) {

                    const response = await fetch(`${url}/stages/status`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`,
                        },
                        body: JSON.stringify({ elementId: stageData.id, stageStatus, firstId, secondId }),
                    });

                    if (!response.ok) {
                        throw new Error(`Ошибка сети: ${response.status}`);
                    }

                    const data = await response.json();
                    showToast('Этап успешно оплачен', 'success');
                } else {
                    showToast('Этап не оплачен, пополниите баланс', 'warning');
                }
            } else {
                console.log(stageData.id, stageStatus, firstId, secondId)
                const response = await fetch(`${url}/stages/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({ elementId: stageData.id, stageStatus, firstId, secondId }),
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status}`);
                }

                const data = await response.json();

                if (stageData.stageStatus === "Не начато") {
                    const newStatus = await fetch(`${url}/agreement`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`,
                        },
                        body: JSON.stringify({ agreementId, newStatus: "В работе" }),
                    });

                    if (!response.ok) {
                        throw new Error(`Ошибка сети: ${response.status}`);
                    }

                    // const newStatusData = await response.json();

                }
                showToast('Статус успешно изменём', 'success');
            }

            // onTrigger()
        } catch (error) {
            showToast('Ошибка при смене статуса', 'danger');
        }
    };

    const handlePostAccount = async () => {
        // console.log(stagr)
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
            console.log(agreementData)
            const { mode, initiatorId, initiatorItemId, receiverId, receiverItemId } = agreementData.agreementInfo;

            // Определяем заказчика и подрядчика
            const customerId = mode === 1 ? initiatorId : receiverId;
            const customerItemId = mode === 1 ? initiatorItemId : receiverItemId;
            const contractorId = mode === 1 ? receiverId : initiatorId;
            const contractorItemId = mode === 1 ? receiverItemId : initiatorItemId;

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

            const entityId = questionnaireData.questionnaireInfo.entityId

            const response = await fetch(`${url}/contractor/account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ entityId, account, firstId, secondId }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка сети: ${response.status}`);
            }

            handleGenerateContractOrAct('act')

            const data = await response.json();
            // alert('Статус успешно изменём');

            handleChangeStageStatus('Подтверждено')

        } catch (error) {
            showToast('Ошибка при смене статуса', 'danger');
        }
    };

    // Функция для определения текста и стилей на основе статуса
    const renderStatus = (mode, stageStatus) => {
        switch (stageStatus) {
            case 'В ожидании заморозки средств':
                if (mode === 'contractor') {
                    return <div>
                        <Typography color="textSecondary">Статус: Ожидание заморозки средств</Typography>
                    </div>
                } else if (mode === 'customer') {
                    return <div>
                        {balance > stageData.totalPrice ?
                            <Typography color="textSecondary">Баланс: {balance} руб.</Typography> : 'Недостаточно средств'
                        }
                        <Typography color="textSecondary">Стоимость этапа: {stageData.totalPrice}</Typography>

                        {balance > stageData.totalPrice ? (
                            <Button onClick={() => handleTopUp()} variant="contained" color="primary" className='w-100'>
                                Заморозить средства
                            </Button>) : (
                            <Button onClick={() => navigate(`/balance`)} variant="contained" color="primary">
                                Пополнить баланс
                            </Button>)}

                    </div>
                } else {
                    return <div>
                        <Typography color="textSecondary">Ошибка!</Typography>
                    </div>
                };
            case 'Не начато':
                if (mode === 'contractor') {
                    return <div>
                        <Typography color="textSecondary">Замороженная сумма: {stageData.stageBalance} руб.</Typography>

                        <Typography color="textSecondary">Статус: Вы еще не приступили к работам</Typography>
                        <Button onClick={() => handleChangeStageStatus("В процессе")} variant="contained" color="primary" className='w-100'>
                            Приступить
                        </Button>
                    </div>
                } else if (mode === 'customer') {
                    return <div>
                        <Typography color="textSecondary">Замороженная сумма: {stageData.stageBalance} руб.</Typography>

                        <Typography color="textSecondary">Статус: Подрядчик еще не приступил к работам</Typography>
                    </div>
                } else {
                    return <div>
                        <Typography color="textSecondary">Ошибка!</Typography>
                    </div>
                };

            case 'В процессе':
                if (mode === 'contractor') {
                    return <div>
                        <Typography color="textSecondary">Статус: В работе</Typography>
                        <Button onClick={() => handleChangeStageStatus("В ожидании подтверждения")} variant="contained" color="primary">
                            Подтвердить выполнение работ
                        </Button>
                    </div>
                } else if (mode === 'customer') {
                    return <div>
                        <Typography color="textSecondary">Статус: В работе</Typography>
                    </div>
                } else {
                    return <div>
                        <Typography color="textSecondary">Ошибка!</Typography>
                    </div>
                };

            case 'В ожидании подтверждения':
                if (mode === 'contractor') {
                    return <div>
                        <Typography color="textSecondary">Статус: Закачик еще не подтвердил выполненные работы</Typography>
                    </div>
                } else if (mode === 'customer') {
                    return <div>
                        <Typography color="textSecondary">Статус: Подтвердите выполненные работы</Typography>
                        <Button onClick={() => handleChangeStageStatus("В ожидании счета на оплату")} variant="contained" color="primary">
                            Подтвердить выполнение работ
                        </Button>
                    </div>
                } else {
                    return <div>
                        <Typography color="textSecondary">Ошибка!</Typography>
                    </div>
                };

            case 'В ожидании счета на оплату':
                if (mode === 'contractor') {
                    return <div>
                        <Typography color="textSecondary">Статус: Выполнение всех работ подтверждено, Введите свой номер оплаты счета</Typography>

                        <TextField
                            label="Номер счета"
                            type='number'
                            variant="outlined"
                            value={account}
                            className='w-100 mb-2 mb-2'
                            onChange={(e) => {
                                const onlyNumbers = e.target.value.replace(/\D/g, ""); // Удаляем все нецифровые символы
                                setAccount(onlyNumbers);
                            }}

                        />
                        <div>
                            <Button onClick={() => handlePostAccount()}
                                variant="contained" color="primary"
                                className='w-100'>
                                Отправить
                            </Button>
                        </div>

                    </div>
                } else if (mode === 'customer') {
                    return <div>
                        <Typography color="textSecondary">Статус: Ожидайте, подрядчик должен ввести счет на оплату</Typography>

                    </div>
                } else {
                    return <div>
                        <Typography color="textSecondary">Ошибка!</Typography>
                    </div>
                };

            case 'Подтверждено':
                if (mode === 'contractor') {
                    return <div>
                        <Typography color="textSecondary">Статус: Выполнение всех работ подтверждено, ожидайте оплаты!</Typography>
                    </div>
                } else if (mode === 'customer') {
                    return <div>
                        <Typography color="textSecondary">Статус: Необходимо оплатить этап </Typography>
                        <Button onClick={() => handleChangeStageStatus("Оплачено")} variant="contained" color="primary" className='w-100'>
                            Оплатить
                        </Button>
                    </div>
                } else {
                    return <div>
                        <Typography color="textSecondary">Ошибка!</Typography>
                    </div>
                };



            case 'Оплачено':
                if (mode === 'contractor') {
                    return <div>
                        <Typography color="textSecondary">Статус: Данный этап оплачен</Typography>
                    </div>
                } else if (mode === 'customer') {
                    return <div>
                        <Typography color="textSecondary">Статус: Данный этап оплачен</Typography>
                    </div>
                } else {
                    return <div>
                        <Typography color="textSecondary">Ошибка!</Typography>
                    </div>
                };

            default:
                return <Typography color="error.main">Статус неизвестен</Typography>;
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
                <Typography id="modal-title" variant="h6" component="h2" color='black' className='text-center'>
                    {/* {mode === 'contractor' ? 'Сведения этапа' : 'Статус для заказчика'} */}
                    Сведения этапа
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <div>

                        {stageData.stageStatus === 'В ожидании заморозки средств' ? (
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
                                {/* <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Управление документами</h3> */}

                                {isContractReady ? (
                                    <div
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
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            backgroundColor: '#2a2a2a',
                                        }}
                                    >
                                        <FaFileWord size={24} color="#f44336" />
                                        <h4 style={{ margin: '10px 0', color: 'white' }}>Договор</h4>
                                        <button
                                            onClick={() => handleGenerateContractOrAct('contract')}
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
                                    </div>
                                )}
                            </div>
                        ) : null}

                        {stageData.stageStatus === 'Подтверждено' ? (
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

                                {isActReady ? (
                                    <div
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
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            backgroundColor: '#2a2a2a',
                                        }}
                                    >
                                        <FaFileWord size={24} color="#f44336" />
                                        <h4 style={{ margin: '10px 0', color: 'white' }}>Акт</h4>
                                        <button
                                            onClick={() => handleGenerateContractOrAct('act')}
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
                                    </div>
                                )}
                            </div>
                        ) : null}

                    </div>
                </Box>

                <Box sx={{ mt: 2 }}>
                    <div>

                        {stageData.stageStatus === 'В ожидании заморозки средств' ? (
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
                                {isEstimateReady ? (
                                    <div
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
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            backgroundColor: '#2a2a2a',
                                        }}
                                    >
                                        <FaFileExcel size={24} color="#f44336" />
                                        <h4 style={{ margin: '10px 0', color: 'white' }}>Смета</h4>
                                        <button
                                            onClick={() => handleGenerateContractOrAct('estimate')}
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
                                    </div>
                                )}
                            </div>
                        ) : null}


                    </div>
                </Box>

                <Box>
                    {renderStatus(mode, stageData.stageStatus)}
                </Box>
            </Box>
        </Modal>
    );
};

export default StageModalWnd;
