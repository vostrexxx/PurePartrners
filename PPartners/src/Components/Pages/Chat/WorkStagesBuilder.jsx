import React, { useState, useEffect } from 'react';
import { TextField, Button, Drawer, List, ListItem, Divider } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const WorkStagesBuilder = ({ agreementId }) => {
    const [stages, setStages] = useState([]); // Список этапов работ
    const [drawerOpen, setDrawerOpen] = useState(false); // Открытие/закрытие шторки
    const [rawStages, setRawStages] = useState([]); // Исходный список
    const [newStageName, setNewStageName] = useState(''); // Название нового этапа
    const url = localStorage.getItem('url');
    const authToken = localStorage.getItem('authToken');

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
                // Парсим данные из ответа и записываем в соответствующие состояния
                setStages(
                    data.stages.map((stage) => ({
                        id: stage.id, // Постоянный ID с бэка
                        name: stage.stageTitle,
                        order: stage.stageOrder,
                        children: stage.subStages.map((subStage) => ({
                            id: subStage.id, // Постоянный ID для подэтапов
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
                    if (rawStagesData.rawStages) {
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
                } else {
                    console.error('Ошибка: поле "rawStages" отсутствует в ответе сервера.');
                }
            }
        } catch (error) {
            console.error('Ошибка при загрузке этапов работ:', error.message);
        }
    };

    fetchStages();
}, [agreementId, authToken, url]);


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
    
        if (!destination) return;
    
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
        const formattedStages = stages.map((stage) => ({
            stageTitle: stage.name,
            totalPrice: stage.children.reduce((sum, child) => sum + (child.totalPrice || 0), 0),
            stageOrder: stage.order,
            isCurrent: false,
            subStages: stage.children.map((child, index) => ({
                subStageTitle: child.subWorkCategoryName,
                subStagePrice: child.totalPrice || 0,
                subStageOrder: index + 1,
            })),
        }));
    
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
            alert('Этапы успешно сохранены!');
            console.log('Ответ сервера:', data);
        } catch (error) {
            console.error('Ошибка при сохранении этапов:', error.message);
            alert('Ошибка при сохранении этапов. Проверьте данные и попробуйте снова.');
        }
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
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div style={{ flex: 1, marginRight: '20px' }}>
                            <h3>Добавить этапы</h3>
                            <TextField
                                label="Название этапа"
                                variant="outlined"
                                fullWidth
                                value={newStageName}
                                onChange={(e) => setNewStageName(e.target.value)}
                                style={{ marginBottom: '10px' }}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleAddStage}
                                style={{ marginBottom: '20px' }}
                            >
                                Добавить этап
                            </Button>

                            <h4>Список этапов работ</h4>
                            {stages.map((stage) => {
                                const totalSum = stage.children.reduce((sum, child) => sum + (child.totalPrice || 0), 0); // Сумма всех totalPrice

                                return (
                                    <Droppable key={stage.id} droppableId={stage.id}>
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
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <h5>
                                                        {stage.order}. {stage.name} — Сумма: {totalSum} руб.
                                                    </h5>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() => handleDeleteStage(stage.id)}
                                                    >
                                                        Удалить
                                                    </Button>
                                                </div>
                                                {stage.children.length === 0 ? (
                                                    <p>Вы не добавили виды работ в этот этап</p>
                                                ) : (
                                                    stage.children.map((child, index) => (
                                                        <Draggable key={child.id} draggableId={child.id} index={index}>
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
                            <h3>Список видов работ</h3>
                            <Droppable droppableId="rawStagesList">
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
                                            <Draggable key={rawStage.id} draggableId={rawStage.id} index={index}>
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
                        onClick={handleSave}
                        style={{ marginRight: '10px' }}
                    >
                        Сохранить
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => setDrawerOpen(false)}>
                        Закрыть
                    </Button>
                </div>
            </Drawer>
        </>
    );
};

export default WorkStagesBuilder;