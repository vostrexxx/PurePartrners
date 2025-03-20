import React, { useState, useEffect, useRef } from 'react';
// import { TextField, Button, Drawer, List, ListItem, Divider } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useProfile } from '../../Context/ProfileContext';
import StageModalWnd from './StageModalWnd'
import { EventSourcePolyfill } from 'event-source-polyfill';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import { FaEdit, FaSave } from 'react-icons/fa';
import { FaPlus } from "react-icons/fa";
import { useToast } from '../../Notification/ToastContext'
// import "react-confirm-alert/src/react-confirm-alert.css";
import Swal from "sweetalert2";
import DocumentStorageButton from './DocumentStorage/DocumentStorageButton';
const WorkStagesBuilder = ({ agreementId, initiatorId, receiverId }) => {
    const showToast = useToast();
    const [stages, setStages] = useState([]); // Список этапов работ
    const [drawerOpen, setDrawerOpen] = useState(false); // Открытие/закрытие шторки
    const [rawStages, setRawStages] = useState([]); // Исходный список
    const [newStageName, setNewStageName] = useState(''); // Название нового этапа
    const url = localStorage.getItem('url');
    const authToken = localStorage.getItem('authToken');

    const [isEditing, setIsEditing] = useState(null);
    // const [trigger, setTrigger] = useState(false)
    const [triggerStages, setTriggerStages] = useState(false);

    const { isSpecialist } = useProfile();

    const [modalOpen, setModalOpen] = useState(false); // Состояние открытия модального окна
    const [modalData, setModalData] = useState({ mode: '', stage: null }); // Хранение mode и stage

    const mode = isSpecialist ? 'contractor' : 'customer';


    // Получение списка "rawStages" с сервера
    useEffect(() => {
        const fetchStages = async () => {
            try {
                const response = await fetch(`${url}/stages?agreementId=${agreementId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status}`);
                }

                const data = await response.json();

                // Проверяем содержимое списков
                const { stages: fetchedStages, notUsedRawStages } = data;

                if ((fetchedStages && fetchedStages.length > 0) || (notUsedRawStages && notUsedRawStages.length > 0)) {

                    // setIsAvailable(false)
                    // Парсим данные из ответа и записываем в соответствующие состояния
                    setStages(
                        data.stages.map((stage) => ({
                            totalPrice: stage.totalPrice,
                            isCustomerApproved: stage.isCustomerApproved,
                            isContractorApproved: stage.isContractorApproved,
                            id: stage.id,
                            name: stage.stageTitle,
                            order: stage.stageOrder,
                            stageStatus: stage.stageStatus,

                            stageBalance: stage.stageBalance,

                            startDate: stage.startDate || null,
                            finishDate: stage.finishDate || null,
                            children: stage.subStages.map((subStage) => ({
                                id: subStage.id,
                                subWorkCategoryName: subStage.subStageTitle,
                                totalPrice: subStage.subStagePrice,
                            })),
                        }))
                    );

                    setRawStages(
                        data.notUsedRawStages.map((rawStage) => ({
                            id: rawStage.id, // Постоянный ID с бэка
                            subWorkCategoryName: rawStage.subStageTitle,
                            totalPrice: rawStage.subStagePrice,
                        }))
                    );
                } else {
                    // Если списки пусты, выполняем уже существующий запрос к /categories/raw-stages
                    const params = new URLSearchParams({ agreementId });
                    const rawStagesResponse = await fetch(`${url}/categories/raw-stages?${params.toString()}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`,
                        },
                    });

                    if (!rawStagesResponse.ok) {
                        throw new Error(`Ошибка сети: ${rawStagesResponse.status}`);
                    }

                    const rawStagesData = await rawStagesResponse.json();
                    if (rawStagesData.rawStages) {
                        // setIsAvailable(false)
                        setRawStages(
                            rawStagesData.rawStages.map((rawStage) => ({
                                id: rawStage.elementId, // Используем elementId как id
                                subWorkCategoryName: rawStage.subWorkCategoryName,
                                totalPrice: rawStage.totalPrice,
                            }))
                        );

                    } else {
                        console.error('Ошибка: поле "rawStages" отсутствует в ответе сервера.');
                    }

                }
            } catch (error) {
                console.error('Ошибка при загрузке этапов работ:', error.message);
            }
        };

        fetchStages();
    }, [agreementId, authToken, url, triggerStages]);

    useEffect(() => {
        const fetchIsEditing = async () => {
            try {
                const response = await fetch(`${url}/stages/is-editing?agreementId=${agreementId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка получения состояния редактирования: ${response.status}`);
                }

                const data = await response.json();
                setIsEditing(data.isEditing);

                if (data.isEditing === false) {
                    showToast("Этапы работ редактируется другим пользователем", 'warning');
                }
            } catch (error) {
                console.error('Ошибка получения состояния редактирования:', error);
            }
        };

        fetchIsEditing();
    }, [agreementId, authToken, url]);

    const eventQueue = useRef([]); // Очередь для обработки событий
    const isProcessingQueue = useRef(false); // Флаг для обработки очереди


    useEffect(() => {
        const processEventQueue = () => {
            if (eventQueue.current.length > 0 && !isProcessingQueue.current) {
                isProcessingQueue.current = true;
                const event = eventQueue.current.shift();

                // console.log("Обрабатывается событие:", event);

                if (event === 'triggerStages') {
                    setStages([])
                    setTriggerStages((prev) => !prev);
                }


                setTimeout(() => {
                    isProcessingQueue.current = false;
                    processEventQueue();
                }, 1000);
            }
        };

        const eventSource = new EventSourcePolyfill(`${url}/stages/events/${agreementId}`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });

        eventSource.onopen = () => {
            console.log("1 - SSE соединение ДЛЯ ЭТАПОВ установлено");
        };

        eventSource.onmessage = (event) => {
            if (event.data.trim() === ':ping') {
                // Игнорируем пинг
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
            console.log("0 - SSE соединение ДЛЯ ЭТАПОВ разорвано");
            eventSource.close();
        };
    }, [agreementId, authToken, url]);



    const handleEdit = async () => {
        // setTrigger(!trigger)
        try {
            const response = await fetch(`${url}/stages/is-editing?agreementId=${agreementId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка получения состояния редактирования: ${response.status}`);
            }

            const data = await response.json();

            if (data.isEditing === false) {
                showToast("Этапы работ редактируется другим пользователем", "warning");
                return;
            }

            // Если состояние null, отправляем запрос на изменение состояния
            const postResponse = await fetch(`${url}/stages/is-editing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    agreementId,
                    isEditing: true,
                }),
            });

            if (!postResponse.ok) {
                throw new Error(`Ошибка установки состояния редактирования: ${postResponse.status}`);
            }

            setIsEditing(true);
        } catch (error) {
            console.error('Ошибка обработки редактирования:', error);
            showToast('Не удалось переключить состояние редактирования', 'warning');
        }
    };

    const handleResetStages = async () => {


        Swal.fire({
            title: "Вы уверены?",
            text: "Сброшенные этапы невозможно будет восстановить",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Да, удалить!",
            cancelButtonText: "Отмена",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const params = new URLSearchParams({ agreementId, firstId: initiatorId, secondId: receiverId });
                    const response = await fetch(`${url}/stages?${params.toString()}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`,
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`Ошибка сброса: ${response.status}`);
                    }

                    const data = await response.json();
                    if (data.success) {
                        setStages([])
                        showToast('Этапы работ успешно сброшены', 'success')
                    } else {
                        showToast('Не удалось сбросить этапы, так как по некоторым из них уже ведутся работы', 'warning')
                    }
                } catch (error) {
                    console.error('Ошибка обработки редактирования:', error);
                }
            }
        });





    };

    // Добавление нового этапа в список
    const handleAddStage = () => {
        if (!newStageName.trim()) {
            showToast('Введите название этапа', 'info');
            return;
        }
        const newStage = {
            id: Date.now().toString(),
            name: newStageName.trim(),
            order: stages.length + 1,
            children: [], // Массив дочерних rawStages
        };
        setStages([...stages, newStage]);
        setNewStageName('');
    };

    // Обработка перетаскивания
    const onDragEnd = (result) => {
        const { source, destination } = result;
        if (isEditing !== true) {
            return;
        }
        if (!destination) return;

        // Находим этап, куда происходит перетаскивание
        const destinationStage = stages.find((stage) => stage.id === destination.droppableId);

        // Если этап утвержден обоими сторонами, запретить любые изменения
        if (destinationStage && destinationStage.isCustomerApproved && destinationStage.isContractorApproved) {
            return;
        }

        // Перемещение внутри rawStages
        if (source.droppableId === 'rawStagesList' && destination.droppableId === 'rawStagesList') {
            const updatedRawStages = Array.from(rawStages);
            const [movedItem] = updatedRawStages.splice(source.index, 1);
            updatedRawStages.splice(destination.index, 0, movedItem);
            setRawStages(updatedRawStages);
        } else if (source.droppableId === 'rawStagesList' && destination.droppableId !== 'rawStagesList') {
            // Перемещение из rawStages в Stage
            const movedRawStage = rawStages[source.index];
            setRawStages((prev) => prev.filter((_, index) => index !== source.index));
            setStages((prev) =>
                prev.map((stage) =>
                    stage.id === destination.droppableId
                        ? { ...stage, children: [...stage.children, movedRawStage] }
                        : stage
                )
            );
        } else if (source.droppableId !== 'rawStagesList' && destination.droppableId !== 'rawStagesList') {
            // Перемещение внутри или между этапами
            const sourceStage = stages.find((stage) => stage.id === source.droppableId);
            const destinationStage = stages.find((stage) => stage.id === destination.droppableId);
            const [movedRawStage] = sourceStage.children.splice(source.index, 1);
            if (sourceStage.id === destinationStage.id) {
                sourceStage.children.splice(destination.index, 0, movedRawStage);
            } else {
                destinationStage.children.splice(destination.index, 0, movedRawStage);
            }
            setStages([...stages]);
        } else if (source.droppableId !== 'rawStagesList' && destination.droppableId === 'rawStagesList') {
            // Перемещение из Stage обратно в rawStages
            const sourceStage = stages.find((stage) => stage.id === source.droppableId);
            const [movedRawStage] = sourceStage.children.splice(source.index, 1);
            setRawStages((prev) => [...prev, movedRawStage]);
            setStages([...stages]);
        }
    };

    const handleDeleteStage = (stageId) => {
        const stageToDelete = stages.find((stage) => stage.id === stageId);
        if (!stageToDelete) return;

        // Перемещаем все дочерние RawStages в левую часть
        setRawStages([...rawStages, ...stageToDelete.children]);

        // Удаляем Stage и пересчитываем порядковые номера
        const updatedStages = stages
            .filter((stage) => stage.id !== stageId)
            .map((stage, index) => ({
                ...stage,
                order: index + 1, // Порядковый номер — новый индекс + 1
            }));

        setStages(updatedStages);
    };

    const handleSave = async () => {
        // Формируем список этапов
        const formattedStages = stages.map((stage) => {
            const isApproved = stage.isCustomerApproved && stage.isContractorApproved;

            return {
                isCustomerApproved: isApproved ? true : false,
                isContractorApproved: isApproved ? true : false,
                // stageStatus: isApproved ? stage.stageStatus || "Не начато" : "В ожидании заморозки средств",
                stageStatus: "В ожидании заморозки средств",
                // elementId: stage.id,
                stageTitle: stage.name,
                totalPrice: stage.children.reduce((sum, child) => sum + (child.totalPrice || 0), 0),
                stageOrder: stage.order,
                startDate: stage.startDate,
                finishDate: stage.finishDate,
                subStages: stage.children.map((child, index) => ({
                    subStageTitle: child.subWorkCategoryName,
                    subStagePrice: child.totalPrice || 0,
                    subStageOrder: index + 1,
                    elementId: child.id
                })),
            };
        });


        // Формируем список неиспользуемых rawStages
        const notUsedRawStages = rawStages.map((rawStage, index) => ({
            subStageTitle: rawStage.subWorkCategoryName,
            subStagePrice: rawStage.totalPrice || 0,
            stageOrder: index + 1,
        }));

        try {
            const response = await fetch(`${url}/stages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ agreementId, stages: formattedStages, notUsedRawStages, firstId: initiatorId, secondId: receiverId }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка сети: ${response.status}`);
            }

            const data = await response.json();

            const postResponse = await fetch(`${url}/stages/is-editing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    agreementId,
                    isEditing: null,
                }),
            });

            if (!postResponse.ok) {
                throw new Error(`Ошибка сброса состояния редактирования: ${postResponse.status}`);
            }

            setIsEditing(null);
            // alert('Этапы успешно сохранены!');
            // console.log('Ответ сервера:', data);

            // setTrigger(!trigger)
        } catch (error) {
            console.error('Ошибка при сохранении этапов:', error.message);
            showToast('Ошибка при сохранении этапов. Проверьте данные и попробуйте снова', 'danger');
        }
    };

    const handleApprove = async (elementId, children, stage) => {


        if (children.length === 0) {
            showToast('Нельзя утвердить этап без видов работ', 'danger')
        } else {

            if (!(stage.startDate && stage.finishDate)) {
                showToast('Нельзя утвердить этап без установленных дат', 'warning')
            } else {
                if (window.confirm(mode === "contractor"
                    ? (stage.isContractorApproved ? "Вы уверены, что хотите снять утверждение?" : "Вы уверены, что хотите утвердить этап?")
                    : (stage.isCustomerApproved ? "Вы уверены, что хотите снять утверждение?" : "Вы уверены, что хотите утвердить этап?")
                )) {
                    try {
                        const response = await fetch(`${url}/stages/approval`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${authToken}`,
                            },
                            body: JSON.stringify({ elementId, agreementId, mode, firstId: initiatorId, secondId: receiverId }),
                        });

                        if (!response.ok) {
                            throw new Error(`Ошибка сети: ${response.status}`);
                        }

                        const data = await response.json();
                        // setTrigger(!trigger)

                    } catch (error) {
                        // console.error('Ошибка при сохранении этапов:', error.message);
                        showToast('Ошибка при утверждении', 'danger');
                    }
                }
            }


        }

    };

    const handleStageStatusModalWnd = (mode, stage) => {
        // console.log(mode, stage); // Логируем для проверки
        setModalData({ mode, stage }); // Сохраняем mode и stage
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setModalData({ mode: '', stage: null });
    };

    return (
        <Container fluid className="py-4">
            <DragDropContext onDragEnd={onDragEnd}>
                <Row>
                    <Col md={6} className="mb-4">
                        <h2 className='text-white text-center fw-bold'>Создание этапа</h2>

                        <Row className="align-items-center g-2 mb-4"> {/* g-2 добавляет отступы между элементами */}
                            <Col className="flex-grow-1"> {/* flex-grow-1 позволяет Form.Control занимать доступное пространство */}
                                <Form.Control
                                    type="text"
                                    placeholder="Название этапа"
                                    value={newStageName}
                                    onChange={(e) => setNewStageName(e.target.value)}
                                    hidden={isEditing !== true}
                                    className="h-100" // Задает высоту 100% для выравнивания по высоте
                                />
                            </Col>
                            <Col xs="auto"> {/* xs="auto" задает минимальную ширину для кнопки */}
                                <Button
                                    variant="primary"
                                    onClick={handleAddStage}
                                    hidden={isEditing !== true}
                                    className="h-100" // Задает высоту 100% для выравнивания по высоте
                                >
                                    <FaPlus />
                                </Button>
                            </Col>
                        </Row>


                        <h4 className='text-white'>Список этапов:</h4>
                        {stages.length === 0 ? <p className='text-white'>Список этапов пока что пуст,
                            вы можете перейти в режим редактирования для добавления этапов</p> : <div></div>}
                        {stages.map((stage) => {
                            const totalSum = stage.children.reduce((sum, child) => sum + (child.totalPrice || 0), 0);
                            const isLocalApproved = mode === 'contractor' ? stage.isContractorApproved : stage.isCustomerApproved;
                            const isBothApproved = stage.isContractorApproved && stage.isCustomerApproved;

                            return (
                                <Droppable key={stage.id} droppableId={stage.id} isDropDisabled={isBothApproved || isEditing !== true}>
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.droppableProps} className="p-3 mb-3 border rounded">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className='two-lines'>
                                                    <h3 className='text-white'>
                                                        {stage.order}. {stage.name}
                                                    </h3>
                                                    <h6 className='text-white mt-3'>
                                                        Сумма: {totalSum} руб.
                                                    </h6>
                                                    <DocumentStorageButton agreementId={agreementId} stage={stage} />
                                                </div>


                                                {!isBothApproved && (
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleDeleteStage(stage.id)}
                                                        hidden={isEditing !== true}
                                                    >
                                                        Удалить
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Статус утверждения */}
                                            <div className="d-flex justify-content-between align-items-center ">
                                                <h6 className='text-white'>
                                                    Статус:{" "}
                                                    {stage.isCustomerApproved && stage.isContractorApproved
                                                        ? "Этап утвержден"
                                                        : mode === "contractor"
                                                            ? stage.isCustomerApproved
                                                                ? "Заказчик утвердил"
                                                                : "Заказчик еще не утвердил"
                                                            : stage.isContractorApproved
                                                                ? "Подрядчик утвердил"
                                                                : "Подрядчик еще не утвердил"}
                                                </h6>

                                                {isBothApproved ? (
                                                    <Button
                                                        variant="outline-info"
                                                        size="sm"
                                                        onClick={() => handleStageStatusModalWnd(mode, stage)}
                                                    >
                                                        Открыть
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        onClick={() => handleApprove(stage.id, stage.children, stage)}
                                                        hidden={isEditing !== null}
                                                    // hiiden={isEditing !== null}

                                                    >
                                                        {isLocalApproved ? "Отменить" : "Утвердить"}
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Даты */}
                                            <Row className="mt-3 mb-3">
                                                <Col xs={6}>
                                                    <Form.Control
                                                        type="date"
                                                        value={stage.startDate ? stage.startDate.split('T')[0] : ''}
                                                        onChange={(e) => {
                                                            if (isEditing === true) {
                                                                const newStartDate = e.target.value;
                                                                setStages((prevStages) =>
                                                                    prevStages.map((s) =>
                                                                        s.id === stage.id ? { ...s, startDate: newStartDate } : s
                                                                    )
                                                                );
                                                            }
                                                        }}
                                                        disabled={isEditing !== true || isBothApproved}
                                                    />
                                                </Col>
                                                <Col xs={6}>
                                                    <Form.Control
                                                        type="date"
                                                        value={stage.finishDate ? stage.finishDate.split('T')[0] : ''}
                                                        onChange={(e) => {
                                                            if (isEditing === true) {
                                                                const newFinishDate = e.target.value;
                                                                setStages((prevStages) =>
                                                                    prevStages.map((s) =>
                                                                        s.id === stage.id ? { ...s, finishDate: newFinishDate } : s
                                                                    )
                                                                );
                                                            }
                                                        }}
                                                        disabled={isEditing !== true || isBothApproved}
                                                    />
                                                </Col>
                                            </Row>

                                            {/* Список видов работ */}
                                            {stage.children.length === 0 ? (
                                                <p className="mt-3 text-white">Вы не добавили виды работ в этот этап</p>
                                            ) : (
                                                stage.children.map((child, index) => (
                                                    <Draggable

                                                        key={child.id}
                                                        draggableId={child.id}
                                                        index={index}
                                                        isDragDisabled={isBothApproved || isLocalApproved || isEditing !== true}
                                                    >
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="p-2 mb-2 bg-secondary text-white rounded"
                                                            >
                                                                {index + 1}. {child.subWorkCategoryName} — {child.totalPrice || "Цена не указана"} руб.
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))
                                            )}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            );
                        })}
                    </Col>

                    {/* Правая панель */}
                    <Col md={6} className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h3 className='text-white'>Список видов работ</h3>
                            <Button
                                variant="danger"
                                onClick={handleResetStages}
                                hidden={!isEditing}
                            >
                                Сбросить этапы работ
                            </Button>
                        </div>

                        <Droppable droppableId="rawStagesList" disabled={isEditing !== true}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="p-3 border rounded"
                                >
                                    {rawStages.map((rawStage, index) => (
                                        <Draggable
                                            key={rawStage.id}
                                            draggableId={rawStage.id}
                                            index={index}
                                            isDragDisabled={isEditing !== true}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="p-2 mb-2 bg-secondary text-white rounded"
                                                >
                                                    {index + 1}. {rawStage.subWorkCategoryName || "Без названия"} —{" "}
                                                    {rawStage.totalPrice || "Цена не указана"} руб.
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </Col>
                </Row>

                {/* Кнопки управления */}
                <div className="text-center mt-4">
                    <Button
                        variant="primary"
                        className="me-2"
                        onClick={handleEdit}
                        hidden={isEditing === true}
                        style={styles.fixedButton}
                    >
                        <FaEdit />
                    </Button>

                    <Button
                        variant="success"
                        className="me-2"
                        onClick={handleSave}
                        hidden={isEditing !== true}
                        style={styles.fixedButton}

                    >
                        <FaSave />
                    </Button>
                </div>
            </DragDropContext>

            {/* Модальное окно */}
            <StageModalWnd
                isOpen={modalOpen}
                onClose={closeModal}
                mode={modalData.mode}
                stage={modalData.stage}
                agreementId={agreementId}
                triggerStages={triggerStages}
                setTriggerStages={setTriggerStages}
                firstId={initiatorId}
                secondId={receiverId}
            />
        </Container>
    );

};

export default WorkStagesBuilder;

const styles = {
    fixedButton: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
};