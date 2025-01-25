import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, Drawer, List, ListItem, Divider } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useProfile } from '../../Context/ProfileContext';
import StageModalWnd from './StageModalWnd'
import { EventSourcePolyfill } from 'event-source-polyfill';

const WorkStagesBuilder = ({ agreementId }) => {
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
                    alert("Этапы работ редактируется другим пользователем.");
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
                alert("Этапы работ редактируется другим пользователем.");
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
            alert('Не удалось переключить состояние редактирования.');
        }
    };

    const handleResetStages = async () => {
        if (window.confirm("Вы уверены, что хотите сбросить все этапы работ?")) {
            try {
                const params = new URLSearchParams({ agreementId });
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
                    // setTrigger(!trigger)

                    alert('Этапы работ успешно сброшены')
                } else {
                    alert('Не удалось сбросить этапы, так как по некоторым из них уже ведутся работы')
                }
                // console.log(data)
            } catch (error) {
                console.error('Ошибка обработки редактирования:', error);
            }
        }

    };

    // Добавление нового этапа в список
    const handleAddStage = () => {
        if (!newStageName.trim()) {
            alert('Введите название этапа!');
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

                stageTitle: stage.name,
                totalPrice: stage.children.reduce((sum, child) => sum + (child.totalPrice || 0), 0),
                stageOrder: stage.order,
                startDate: stage.startDate,
                finishDate: stage.finishDate,
                subStages: stage.children.map((child, index) => ({
                    subStageTitle: child.subWorkCategoryName,
                    subStagePrice: child.totalPrice || 0,
                    subStageOrder: index + 1,
                })),
            };
        });


        // Формируем список неиспользуемых rawStages
        const notUsedRawStages = rawStages.map((rawStage, index) => ({
            subStageTitle: rawStage.subWorkCategoryName,
            subStagePrice: rawStage.totalPrice || 0,
            stageOrder: index + 1,
        }));

        // Подготовка тела запроса
        const payload = {
            agreementId,
            stages: formattedStages,
            notUsedRawStages, // Добавляем список неиспользуемых rawStages
        };

        try {
            const response = await fetch(`${url}/stages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(payload),
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
            alert('Этапы успешно сохранены!');
            // console.log('Ответ сервера:', data);

            // setTrigger(!trigger)
        } catch (error) {
            console.error('Ошибка при сохранении этапов:', error.message);
            alert('Ошибка при сохранении этапов. Проверьте данные и попробуйте снова.');
        }
    };

    const handleApprove = async (elementId, children) => {

        if (children.length === 0) {
            alert('Нельзя утвердить этап без видов работ')
        } else {
            // if (window.confirm("Вы уверены, что хотите утвердить этап?")) {
            try {
                const response = await fetch(`${url}/stages/approval`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({ elementId, agreementId, mode }),
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status}`);
                }

                const data = await response.json();
                // setTrigger(!trigger)

            } catch (error) {
                // console.error('Ошибка при сохранении этапов:', error.message);
                alert('Ошибка при утверждении.');
            }
            // }
        }

    };

    const handleStageStatusModalWnd = (mode, stage) => {
        // console.log(mode, stage); // Логируем для проверки
        setModalData({ mode, stage }); // Сохраняем mode и stage
        setModalOpen(true); // Открываем модальное окно
    };

    const closeModal = () => {
        setModalOpen(false); // Закрываем модальное окно
        setModalData({ mode: '', stage: null }); // Сбрасываем данные
    };

    return (
        <>
            <Button onClick={() => setDrawerOpen(true)}>Открыть этапы работ</Button>
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{ style: { width: '100%' } }}
            >
                <div style={{ padding: '20px', display: 'flex', height: '100%' }}>
                    {/* Левая панель */}
                    <DragDropContext onDragEnd={onDragEnd} >
                        <div style={{ flex: 1, marginRight: '20px' }}>
                            <h3>Добавить этапы</h3>
                            <TextField
                                label="Название этапа"
                                variant="outlined"
                                fullWidth
                                value={newStageName}
                                onChange={(e) => setNewStageName(e.target.value)}
                                style={{ marginBottom: '10px' }}
                                disabled={isEditing !== true}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleAddStage}
                                style={{ marginBottom: '20px' }}
                                disabled={isEditing !== true}
                            >
                                Добавить этап
                            </Button>

                            <h4>Список этапов работ</h4>
                            {stages.map((stage) => {
                                const totalSum = stage.children.reduce((sum, child) => sum + (child.totalPrice || 0), 0);
                                const isLocalApproved = mode === 'contractor' ? stage.isContractorApproved : stage.isCustomerApproved;
                                const isBothApproved = stage.isContractorApproved & stage.isCustomerApproved ? true : false
                                // console.log(stages,'asdasdadassd')
                                return (
                                    <Droppable key={stage.id} droppableId={stage.id} isDropDisabled={isBothApproved || isEditing !== true}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                style={{
                                                    padding: '10px',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '5px',
                                                    marginBottom: '10px',
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} disabled={isEditing !== true}>
                                                    <h5>
                                                        {stage.order}. {stage.name} — Сумма: {totalSum} руб.
                                                    </h5>

                                                    {!isBothApproved ? <Button
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() => handleDeleteStage(stage.id)}
                                                        disabled={isEditing !== true}
                                                    >
                                                        Удалить
                                                    </Button> : null}

                                                </div>

                                                {/* {console.log('asdasdadasdasdasdasd', stage)} */}

                                                {/* Утверждение */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <h5>
                                                        Статус:
                                                        {stage.isCustomerApproved && stage.isContractorApproved ? (
                                                            ' Этап утвержден'
                                                        ) : mode === 'contractor' ? (
                                                            stage.isCustomerApproved ?
                                                                ' Заказчик утвердил' :
                                                                ' Заказчик еще не утвердил'
                                                        ) : (
                                                            stage.isContractorApproved ?
                                                                ' Подрядчик утвердил' :
                                                                ' Подрядчик еще не утвердил'
                                                        )}
                                                    </h5>

                                                    {isBothApproved ? (<Button
                                                        variant="outlined"
                                                        color="info"
                                                        onClick={() => handleStageStatusModalWnd(mode, stage)} // Передаем mode и stage
                                                    >
                                                        Открыть
                                                    </Button>)
                                                        : (
                                                            <Button
                                                                variant="outlined"
                                                                color="success"
                                                                onClick={() => handleApprove(stage.id, stage.children)}
                                                                disabled={isEditing !== null}
                                                            >
                                                                {isLocalApproved ? 'Отменить' : 'Утвердить'}
                                                            </Button>
                                                        )}



                                                </div>

                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        gap: '15px',
                                                        backgroundColor: '#f9f9f9',
                                                        padding: '10px',
                                                        borderRadius: '8px',
                                                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                                                        marginTop: '10px',
                                                        alignItems: 'center', // Для выравнивания полей по вертикали
                                                    }}
                                                >
                                                    <TextField
                                                        label="Дата начала"
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
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                        style={{
                                                            backgroundColor: 'white',
                                                            borderRadius: '5px',
                                                            flex: 1, // Растягиваем поле ввода равномерно
                                                        }}
                                                        disabled={isEditing !== true}
                                                    />

                                                    <TextField
                                                        label="Дата окончания"
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
                                                        InputLabelProps={{
                                                            shrink: true,
                                                        }}
                                                        style={{
                                                            backgroundColor: 'white',
                                                            borderRadius: '5px',
                                                            flex: 1, // Растягиваем поле ввода равномерно
                                                        }}
                                                        disabled={isEditing !== true}
                                                    />
                                                </div>

                                                {/* {console.log(modalData.stage.id || 'нема')} */}




                                                {stage.children.length === 0 ? (
                                                    <p>Вы не добавили виды работ в этот этап</p>
                                                ) : (
                                                    stage.children.map((child, index) => (
                                                        <Draggable key={child.id} draggableId={child.id} index={index} isDragDisabled={isBothApproved || isLocalApproved || isEditing !== true}>
                                                            {(provided) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    style={{
                                                                        padding: '5px',
                                                                        margin: '5px 0',
                                                                        backgroundColor: '#f9f9f9',
                                                                        borderRadius: '3px',
                                                                        ...provided.draggableProps.style,
                                                                    }}
                                                                >
                                                                    {index + 1}. {child.subWorkCategoryName} —{' '}
                                                                    {child.totalPrice || 'Цена не указана'} руб.
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

                        </div>

                        <Divider orientation="vertical" flexItem />

                        {/* Правая панель */}
                        <div style={{ flex: 1, marginLeft: '20px' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between', // Размещаем элементы по краям
                                alignItems: 'center', // Выравниваем элементы по вертикали
                                gap: '15px', // Для выравнивания полей по вертикали
                            }}
                            >
                                <h3>Список видов работ</h3>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleResetStages}
                                    style={{ marginRight: '10px' }}
                                    disabled={!isEditing}
                                >
                                    Сбросить этапы работ
                                </Button>
                            </div>

                            <Droppable droppableId="rawStagesList" disabled={isEditing !== true}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        style={{
                                            padding: '10px',
                                            border: '1px solid #ccc',
                                            borderRadius: '5px',
                                        }}
                                    >
                                        {rawStages.map((rawStage, index) => (
                                            <Draggable key={rawStage.id} draggableId={rawStage.id} index={index} disabled={isEditing !== true}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{
                                                            padding: '5px',
                                                            margin: '5px 0',
                                                            backgroundColor: '#e9ecef',
                                                            borderRadius: '3px',
                                                            ...provided.draggableProps.style,
                                                        }}
                                                    >
                                                        {index + 1}. {rawStage.subWorkCategoryName || 'Без названия'} —{' '}
                                                        {rawStage.totalPrice || 'Цена не указана'} руб.
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    </DragDropContext>
                </div>

                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleEdit}
                        style={{ marginRight: '10px' }}
                        disabled={isEditing === true}
                    >
                        Редактировать
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        style={{ marginRight: '10px' }}
                        disabled={isEditing !== true}
                    >
                        Сохранить
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => setDrawerOpen(false)}>
                        Закрыть
                    </Button>
                </div>

                <StageModalWnd
                    // key={stage?.id || Math.random()} // Используем ключ для принудительного перерендера
                    isOpen={modalOpen}
                    onClose={closeModal}
                    mode={modalData.mode} // Передаем mode
                    stage={modalData.stage} // Передаем stage
                    agreementId={agreementId}
                    triggerStages={triggerStages}
                    setTriggerStages={setTriggerStages} // Пробрасываем функцию изменения
                // id={stage.id} // Передаем stage
                />

            </Drawer>


        </>
    );
};

export default WorkStagesBuilder;