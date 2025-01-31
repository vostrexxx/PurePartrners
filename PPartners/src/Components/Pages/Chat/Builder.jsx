import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, Select, MenuItem, IconButton, Drawer } from '@mui/material';
import { Add, Remove, Menu } from '@mui/icons-material';
import ChangeCard from './ChangeCard';
import BuilderModalWnd from './BuilderModalWnd';
import DocumentManager from './DocumentManager';
import { EventSourcePolyfill } from 'event-source-polyfill';
import MeasureUnitAutocomplete from '../SearchComponent/MeasureUnitAutocomplete';

const Builder = ({ agreementId, initiatorId, receiverId }) => {
    const [estimate, setEstimate] = useState([]);
    const [originalEstimate, setOriginalEstimate] = useState([]);
    const [isNewBuilder, setIsNewBuilder] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(null);
    const [changes, setChanges] = useState([]); // Хранение изменений

    const url = localStorage.getItem("url");
    const authToken = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    const stompClientRef = useRef(null);

    const [isStompConnected, setIsStompConnected] = useState(false);

    // const [triggerGet, setTriggerGet] = useState(false);

    const [triggerEstimate, setTriggerEstimate] = useState(false);
    const [triggerChangeCards, setTriggerChangeCards] = useState(false);


    const [modalOpen, setModalOpen] = useState(false); // Состояние открытия модального окна


    const closeModal = () => {
        setModalOpen(false); // Закрываем модальное окно
    };

    const handleOpenModal = () => {
        setModalOpen(true); // Открываем модальное окно
    };

    // const triggerChangeCards_triggerEstimate = () => {
    //     setTriggerChangeCards(!triggerChangeCards);
    //     // setTriggerEstimate(!triggerEstimate);
    // };

    const eventQueue = useRef([]); // Очередь для обработки событий
    const isProcessingQueue = useRef(false); // Флаг для обработки очереди

    useEffect(() => {
        const processEventQueue = () => {
            if (eventQueue.current.length > 0 && !isProcessingQueue.current) {
                isProcessingQueue.current = true;
                const event = eventQueue.current.shift();

                console.log("Обрабатывается событие:", event);

                if (event === 'triggerChangeCards') {
                    setTriggerChangeCards((prev) => !prev);
                }

                if (event === 'triggerEstimate') {
                    setTriggerEstimate((prev) => !prev);
                }

                // Устанавливаем задержку перед обработкой следующего события
                setTimeout(() => {
                    isProcessingQueue.current = false;
                    processEventQueue(); // Обрабатываем следующее событие
                }, 1000); // Задержка 1 секунда
            }
        };

        const eventSource = new EventSourcePolyfill(`${url}/categories/events/${agreementId}`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });

        eventSource.onopen = () => {
            console.log("1 - SSE соединение ДЛЯ СМЕТЫ установлено");
        };

        eventSource.onmessage = (event) => {
            if (event.data.trim() === ':ping') {
                // Игнорируем пинг
                return;
            }

            console.log("SSE msg: event.data - ", event.data);

            // Добавляем событие в очередь
            eventQueue.current.push(event.data);

            // Запускаем обработку очереди
            processEventQueue();
        };

        eventSource.onerror = (error) => {
            console.error("Ошибка SSE:", error);
            eventSource.close();
        };

        return () => {
            console.log("0 - SSE соединение ДЛЯ СМЕТЫ разорвано");
            eventSource.close();
        };
    }, [agreementId, authToken, url]);

    useEffect(() => {
        const fetchGetChanges = async () => {
            try {
                const response = await fetch(`${url}/categories/changes?agreementId=${agreementId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка получения изменений: ${response.status}`);
                }

                const data = await response.json();
                setChanges(data.changes || []); // Устанавливаем изменения
            } catch (error) {
                console.error('Ошибка получения изменений:', error);
            }
        };

        fetchGetChanges();
    }, [agreementId, authToken, triggerChangeCards]);

    useEffect(() => {
        const fetchIsEditing = async () => {
            try {
                const response = await fetch(`${url}/categories/is-editing?agreementId=${agreementId}`, {
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
                    alert("Смета редактируется другим пользователем.");
                }
            } catch (error) {
                console.error('Ошибка получения состояния редактирования:', error);
            }
        };

        fetchIsEditing();
    }, [agreementId, authToken, url]);

    // Функция для обработки кнопки "Редактировать"
    const handleEdit = async () => {
        try {
            const response = await fetch(`${url}/categories/is-editing?agreementId=${agreementId}`, {
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
                alert("Смета редактируется другим пользователем.");
                return;
            }

            // Если состояние null, отправляем запрос на изменение состояния
            const postResponse = await fetch(`${url}/categories/is-editing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    agreementId,
                    isEditing: true,
                    initiatorId: userId
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

    useEffect(() => {
        const fetchEstimate = async () => {
            try {
                const params = new URLSearchParams({ agreementId });
                const response = await fetch(`${url}/categories/estimate?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка получения сметы: ${response.status}`);
                }

                const data = await response.json();

                if (data.estimate.length === 0) {
                    setEstimate([]);
                    setOriginalEstimate([]);
                    setIsNewBuilder(true);
                } else {
                    const parsedEstimate = data.estimate.map((item, index) => ({
                        // nodeId: `${index + 1}`,
                        nodeId: item.nodeId,
                        elementId: item.elementId,
                        type: 1,
                        subWorkCategoryName: item.subWorkCategoryName,
                        subSubWorkCategories: item.subSubWorkCategories.map((subItem, subIndex) => ({
                            ...subItem,
                            elementId: subItem.elementId,
                            // nodeId: `${index + 1}.${subIndex + 1}`,
                            nodeId: subItem.nodeId,

                        })),
                    }));

                    setEstimate(parsedEstimate);
                    setOriginalEstimate(parsedEstimate);
                    setIsNewBuilder(false);
                }
            } catch (error) {
                console.error('Ошибка загрузки сметы:', error);
            }
        };

        fetchEstimate();
    }, [agreementId, authToken, url, triggerEstimate]);

    const handleAddOrangeItem = (initialName = '') => {
        const newOrange = {
            elementId: Date.now().toString(),
            nodeId: `${estimate.length + 1}`,
            type: 1,
            subWorkCategoryName: initialName,
            subSubWorkCategories: [],
        };

        setEstimate((prev) => [...prev, newOrange]);
    };

    const handleRemoveOrangeItem = (orangeId) => {
        setEstimate((prev) => prev.filter((orange) => orange.elementId !== orangeId));
    };

    const handleAddSubItem = (orangeId) => {
        setEstimate((prevEstimate) => {
            return prevEstimate.map((orange) => {
                if (orange.elementId === orangeId) {
                    const newSubItem = {
                        elementId: Date.now().toString(),
                        nodeId: `${orange.nodeId}.${orange.subSubWorkCategories.length + 1}`,
                        subSubWorkCategoryName: '',
                        workAmount: '',
                        measureUnit: '',
                        price: '',
                    };

                    return {
                        ...orange,
                        subSubWorkCategories: [...orange.subSubWorkCategories, newSubItem],
                    };
                }
                return orange;
            });
        });
    };

    const handleRemoveSubItem = (orangeId, subItemId) => {
        setEstimate((prev) =>
            prev.map((orange) =>
                orange.elementId === orangeId
                    ? {
                        ...orange,
                        subSubWorkCategories: orange.subSubWorkCategories.filter(
                            (subItem) => subItem.elementId !== subItemId
                        ),
                    }
                    : orange
            )
        );
    };

    const handleSubItemChange = (orangeId, subItemId, field, value) => {
        setEstimate((prevEstimate) => {
            return prevEstimate.map((orange) => {
                if (orange.elementId === orangeId) {
                    const updatedSubCategories = orange.subSubWorkCategories.map((subItem) =>
                        subItem.elementId === subItemId
                            ? { ...subItem, [field]: value }
                            : subItem
                    );

                    return { ...orange, subSubWorkCategories: updatedSubCategories };
                }
                return orange;
            });
        });
    };

    const handleOrangeTextChange = (orangeId, value) => {
        setEstimate((prev) =>
            prev.map((orange) => (orange.elementId === orangeId ? { ...orange, subWorkCategoryName: value } : orange))
        );
    };

    // const generateChanges = (original, updated) => {
    //     const changes = [];

    //     // Добавленные элементы
    //     const added = updated.filter(item => !original.some(orig => orig.elementId === item.elementId));
    //     added.forEach(item => {
    //         changes.push({
    //             operation: 'add',
    //             type: item.type,
    //             elementId: item.elementId,
    //             updatedFields: {
    //                 subWorkCategoryName: item.subWorkCategoryName,
    //                 agreementId,
    //                 nodeId: item.nodeId,
    //             },
    //             subSubCategories: item.subSubWorkCategories.map(sub => ({
    //                 elementId: sub.elementId,
    //                 subSubWorkCategoryName: sub.subSubWorkCategoryName,
    //                 workAmount: sub.workAmount,
    //                 measureUnit: sub.measureUnit,
    //                 price: sub.price,
    //                 nodeId: sub.nodeId,
    //             })),
    //         });
    //     });

    //     // Удалённые элементы
    //     const removed = original.filter(item => !updated.some(upd => upd.elementId === item.elementId));
    //     removed.forEach(item => {
    //         changes.push({
    //             operation: 'delete',
    //             type: item.type,
    //             elementId: item.elementId,
    //             updatedFields: {
    //                 subWorkCategoryName: item.subWorkCategoryName,
    //                 agreementId,
    //                 nodeId: item.nodeId,
    //             },
    //             subSubCategories: item.subSubWorkCategories.map(sub => ({
    //                 elementId: sub.elementId,
    //                 subSubWorkCategoryName: sub.subSubWorkCategoryName,
    //                 workAmount: sub.workAmount,
    //                 measureUnit: sub.measureUnit,
    //                 price: sub.price,
    //                 nodeId: sub.nodeId,
    //             })),
    //         });
    //     });

    //     // Обновлённые элементы
    //     updated.forEach(item => {
    //         const originalItem = original.find(orig => orig.elementId === item.elementId);
    //         if (originalItem) {
    //             const updatedFields = {};

    //             if (originalItem.subWorkCategoryName !== item.subWorkCategoryName) {
    //                 updatedFields.subWorkCategoryName = item.subWorkCategoryName;
    //             }

    //             if (Object.keys(updatedFields).length > 0) {
    //                 updatedFields.agreementId = agreementId;
    //                 updatedFields.nodeId = item.nodeId;
    //                 changes.push({
    //                     operation: 'update',
    //                     type: item.type,
    //                     elementId: item.elementId,
    //                     updatedFields,
    //                 });
    //             }

    //             // Обработка вложенных subSubWorkCategories
    //             const subChanges = generateSubCategoryChanges(originalItem.subSubWorkCategories, item.subSubWorkCategories, item.elementId);
    //             changes.push(...subChanges);
    //         }
    //     });

    //     return changes;
    // };

    // const generateSubCategoryChanges = (originalSub, updatedSub, parentId) => {
    //     const subChanges = [];

    //     // Добавленные подкатегории
    //     const added = updatedSub.filter(sub => !originalSub.some(orig => orig.elementId === sub.elementId));
    //     added.forEach(sub => {
    //         subChanges.push({
    //             operation: 'add',
    //             type: 2,
    //             updatedFields: {
    //                 subSubWorkCategoryName: sub.subSubWorkCategoryName,
    //                 workAmount: sub.workAmount,
    //                 measureUnit: sub.measureUnit,
    //                 price: sub.price,
    //                 nodeId: sub.nodeId,
    //             },
    //             parentId,
    //         });
    //     });

    //     // Удалённые подкатегории
    //     const removed = originalSub.filter(sub => !updatedSub.some(upd => upd.elementId === sub.elementId));
    //     removed.forEach(sub => {
    //         subChanges.push({
    //             operation: 'delete',
    //             type: 2,
    //             elementId: sub.elementId,
    //             updatedFields: {
    //                 subSubWorkCategoryName: sub.subSubWorkCategoryName,
    //                 workAmount: sub.workAmount,
    //                 measureUnit: sub.measureUnit,
    //                 price: sub.price,
    //                 nodeId: sub.nodeId,
    //             },
    //             parentId,
    //         });
    //     });

    //     // Обновлённые подкатегории
    //     updatedSub.forEach(sub => {
    //         const originalSubItem = originalSub.find(orig => orig.elementId === sub.elementId);
    //         if (originalSubItem) {
    //             const updatedFields = {};

    //             if (originalSubItem.subSubWorkCategoryName !== sub.subSubWorkCategoryName) {
    //                 updatedFields.subSubWorkCategoryName = sub.subSubWorkCategoryName;
    //             }
    //             if (originalSubItem.workAmount !== sub.workAmount) {
    //                 updatedFields.workAmount = sub.workAmount;
    //             }
    //             if (originalSubItem.measureUnit !== sub.measureUnit) {
    //                 updatedFields.measureUnit = sub.measureUnit;
    //             }
    //             if (originalSubItem.price !== sub.price) {
    //                 updatedFields.price = sub.price;
    //             }

    //             if (Object.keys(updatedFields).length > 0) {
    //                 updatedFields.nodeId = sub.nodeId;
    //                 subChanges.push({
    //                     operation: 'update',
    //                     type: 2,
    //                     elementId: sub.elementId,
    //                     updatedFields,
    //                 });
    //             }
    //         }
    //     });

    //     return subChanges;
    // };

    const generateChanges = (original, updated) => {
        const changes = [];

        // Добавленные элементы
        const added = updated.filter(item => !original.some(orig => orig.elementId === item.elementId));
        added.forEach(item => {
            changes.push({
                operation: 'add',
                type: item.type,
                elementId: item.elementId,
                updatedFields: {
                    subWorkCategoryName: item.subWorkCategoryName,
                    agreementId,
                    nodeId: item.nodeId,
                },
                subSubCategories: item.subSubWorkCategories.map(sub => ({
                    elementId: sub.elementId,
                    subSubWorkCategoryName: sub.subSubWorkCategoryName,
                    workAmount: sub.workAmount,
                    measureUnit: sub.measureUnit,
                    price: sub.price,
                    nodeId: sub.nodeId,
                })),
            });
        });

        // Удалённые элементы
        const removed = original.filter(item => !updated.some(upd => upd.elementId === item.elementId));
        removed.forEach(item => {
            changes.push({
                operation: 'delete',
                type: item.type,
                elementId: item.elementId,
                updatedFields: {
                    subWorkCategoryName: item.subWorkCategoryName,
                    agreementId,
                    nodeId: item.nodeId,
                },
                subSubCategories: item.subSubWorkCategories.map(sub => ({
                    elementId: sub.elementId,
                    subSubWorkCategoryName: sub.subSubWorkCategoryName,
                    workAmount: sub.workAmount,
                    measureUnit: sub.measureUnit,
                    price: sub.price,
                    nodeId: sub.nodeId,
                })),
            });
        });

        // Обновлённые элементы
        updated.forEach(item => {
            const originalItem = original.find(orig => orig.elementId === item.elementId);
            if (originalItem) {
                const updatedFields = {};

                if (originalItem.subWorkCategoryName !== item.subWorkCategoryName) {
                    updatedFields.subWorkCategoryName = item.subWorkCategoryName;
                }

                if (Object.keys(updatedFields).length > 0) {
                    updatedFields.agreementId = agreementId;
                    updatedFields.nodeId = item.nodeId;
                    changes.push({
                        operation: 'update',
                        type: item.type,
                        elementId: item.elementId,
                        updatedFields,
                    });
                }

                // Обработка вложенных subSubWorkCategories
                const subChanges = generateSubCategoryChanges(
                    originalItem.subSubWorkCategories,
                    item.subSubWorkCategories,
                    item.elementId,
                    item.nodeId // Передаем nodeId родительского элемента
                );
                changes.push(...subChanges);
            }
        });

        return changes;
    };

    const generateSubCategoryChanges = (originalSub, updatedSub, parentId, parentNodeId) => {
        const subChanges = [];

        // Добавленные подкатегории
        const added = updatedSub.filter(sub => !originalSub.some(orig => orig.elementId === sub.elementId));
        added.forEach(sub => {
            subChanges.push({
                operation: 'add',
                type: 2,
                updatedFields: {
                    subSubWorkCategoryName: sub.subSubWorkCategoryName,
                    workAmount: sub.workAmount,
                    measureUnit: sub.measureUnit,
                    price: sub.price,
                    nodeId: sub.nodeId,
                },
                parentId,
                parentNodeId, // Добавляем nodeId родительского элемента
            });
        });

        // Удалённые подкатегории
        const removed = originalSub.filter(sub => !updatedSub.some(upd => upd.elementId === sub.elementId));
        removed.forEach(sub => {
            subChanges.push({
                operation: 'delete',
                type: 2,
                elementId: sub.elementId,
                updatedFields: {
                    subSubWorkCategoryName: sub.subSubWorkCategoryName,
                    workAmount: sub.workAmount,
                    measureUnit: sub.measureUnit,
                    price: sub.price,
                    nodeId: sub.nodeId,
                },
                parentId,
                parentNodeId, // Добавляем nodeId родительского элемента
            });
        });

        // Обновлённые подкатегории
        updatedSub.forEach(sub => {
            const originalSubItem = originalSub.find(orig => orig.elementId === sub.elementId);
            if (originalSubItem) {
                const updatedFields = {};

                if (originalSubItem.subSubWorkCategoryName !== sub.subSubWorkCategoryName) {
                    updatedFields.subSubWorkCategoryName = sub.subSubWorkCategoryName;
                }
                if (originalSubItem.workAmount !== sub.workAmount) {
                    updatedFields.workAmount = sub.workAmount;
                }
                if (originalSubItem.measureUnit !== sub.measureUnit) {
                    updatedFields.measureUnit = sub.measureUnit;
                }
                if (originalSubItem.price !== sub.price) {
                    updatedFields.price = sub.price;
                }

                if (Object.keys(updatedFields).length > 0) {
                    updatedFields.nodeId = sub.nodeId;
                    subChanges.push({
                        operation: 'update',
                        type: 2,
                        elementId: sub.elementId,
                        updatedFields,
                        parentId,
                        parentNodeId, // Добавляем nodeId родительского элемента
                    });
                }
            }
        });

        return subChanges;
    };

    const handleFormated = async () => {

        const params = new URLSearchParams({ agreementId });
        fetch(`${url}/document/presence?${params.toString()}`, {
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
            })
            .catch((error) => {
                console.error(`Ошибка при получении информации по документам: ${error.message}`);
            });

    }

    // Функция для сохранения сметы
    const handleSave = async () => {
        try {
            if (isNewBuilder) {
                const response = await fetch(`${url}/categories/estimate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({ estimate, agreementId, firstId: initiatorId, secondId: receiverId }),
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сохранения сметы: ${response.status}`);
                }

                alert('Смета успешно сохранена!');
                setOriginalEstimate([...estimate]);
                setIsNewBuilder(false);

                // Сбрасываем состояние редактирования
                const postResponse = await fetch(`${url}/categories/is-editing`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({
                        agreementId,
                        isEditing: null,
                        initiatorId: userId

                    }),
                });

                if (!postResponse.ok) {
                    throw new Error(`Ошибка сброса состояния редактирования: ${postResponse.status}`);
                }

                setIsEditing(null);
                // setTriggerGet(!triggerGet)

            } else {
                const changes = generateChanges(originalEstimate, estimate);

                if (changes.length > 0) {
                    const response = await fetch(`${url}/categories/changes`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${authToken}`,
                        },
                        body: JSON.stringify({ changes, agreementId, initiatorId: userId, firstId: initiatorId, secondId: receiverId }),
                    });

                    if (!response.ok) {
                        throw new Error(`Ошибка обновления сметы: ${response.status}`);
                    }

                    alert('Изменения успешно сохранены!');
                    setOriginalEstimate([...estimate]);

                }

                // Сбрасываем состояние редактирования
                const postResponse = await fetch(`${url}/categories/is-editing`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({
                        agreementId,
                        isEditing: null,
                        initiatorId: userId

                    }),
                });

                if (!postResponse.ok) {
                    throw new Error(`Ошибка сброса состояния редактирования: ${postResponse.status}`);
                }

                setIsEditing(null);
                // setTriggerGet(!triggerGet)
            }
        } catch (error) {
            console.error('Ошибка сохранения изменений:', error);
            alert('Не удалось сохранить изменения.');
        }
    };

    return (
        <>
            <Button
                variant="contained"
                color="primary"
                startIcon={<Menu />}
                onClick={() => setDrawerOpen(true)}
                style={{ marginBottom: '20px' }}
            >
                Открыть смету
            </Button>

            {/* Шторка (Drawer) */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{ style: { width: '100%' } }} // Шторка на всю ширину
            >
                <div style={{ padding: '20px' }}>
                    <h2>Редактор сметы</h2>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => setDrawerOpen(false)}
                        style={{ marginBottom: '20px' }}
                    >
                        Закрыть
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleEdit}
                        style={{ marginBottom: '20px', marginLeft: '10px' }}
                        disabled={isEditing === true}
                    >
                        Редактировать
                    </Button>

                    <Button
                        variant="contained"
                        color="submit"
                        onClick={handleOpenModal}
                        style={{ marginBottom: '20px', marginLeft: '10px' }}
                    >
                        Загрузить шаблон
                    </Button>

                    <BuilderModalWnd
                        isOpen={modalOpen}
                        onClose={closeModal}
                        agreementId={agreementId}
                    // onTrigger={() => setTriggerEstimate()}
                    />

                    <div>

                        {estimate.map((orange) => (
                            <React.Fragment key={orange.nodeId}>
                                {/* Блок категории */}
                                <div style={styles.orangeBox}>
                                    <div style={styles.orangeHeader}>
                                    <p>{orange.nodeId}</p>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleRemoveOrangeItem(orange.elementId)}
                                            disabled={isEditing !== true}
                                        >
                                            <Remove />
                                        </IconButton>
                                        <TextField
                                            placeholder="Введите наименование категории"
                                            variant="outlined"
                                            size="small"
                                            style={styles.inputField}
                                            value={orange.subWorkCategoryName}
                                            onChange={(e) =>
                                                handleOrangeTextChange(orange.elementId, e.target.value)
                                            }
                                            disabled={isEditing !== true}
                                        />
                                        <Button
                                            variant="contained"
                                            style={styles.addButton}
                                            onClick={() => handleAddSubItem(orange.elementId)}
                                            disabled={isEditing !== true}
                                        >
                                            <Add />
                                        </Button>
                                    </div>
                                    

                                    {/* <p>Здесь должны отображаться карточки изменения и удаления рыжих</p> */}

                                    {changes
                                        .filter(
                                            (change) =>
                                                (change.operation === 'update' || change.operation === 'delete') &&
                                                change.parentNodeId === null &&
                                                change.updatedFields.nodeId === orange.nodeId
                                                                                    )
                                        .map((change, index) => (
                                            <ChangeCard
                                                key={`${change.nodeId}-add-${index}`}
                                                operation={change.operation}
                                                data={change}
                                                url={url}
                                                authToken={authToken}
                                                agreementId={agreementId}
                                                userId={userId}
                                                firstId={initiatorId}
                                                secondId={receiverId}
                                            />
                                        ))}
                                </div>

                                {orange.subSubWorkCategories.map((subItem) => (
                                    <div key={subItem.nodeId}>
                                        {/* Блок подкатегории */}
                                        <div style={styles.whiteBox}>
                                        <p>{subItem.nodeId}</p>
                                            <TextField
                                                placeholder="Наименование подкатегории"
                                                variant="outlined"
                                                size="small"
                                                style={styles.inputField}
                                                value={subItem.subSubWorkCategoryName || ''}
                                                onChange={(e) =>
                                                    handleSubItemChange(
                                                        orange.elementId,
                                                        subItem.elementId,
                                                        'subSubWorkCategoryName',
                                                        e.target.value
                                                    )
                                                }
                                                disabled={isEditing !== true}
                                            />
                                            <TextField
                                                placeholder="Объем работ"
                                                variant="outlined"
                                                size="small"
                                                style={styles.inputFieldSmall}
                                                value={subItem.workAmount || ''}
                                                onChange={(e) => {
                                                    const newValue = e.target.value.replace(/[^0-9.,]/g, ''); // Оставляем только цифры, точку и запятую
                                                    handleSubItemChange(
                                                        orange.elementId,
                                                        subItem.elementId,
                                                        'workAmount',
                                                        newValue
                                                    );
                                                }}
                                                disabled={isEditing !== true}
                                                InputProps={{
                                                    inputMode: 'decimal', // Показывает цифровую клавиатуру с десятичной точкой на мобильных устройствах
                                                    pattern: '[0-9]*', // Ограничение на ввод только цифр (основное для валидации)
                                                }}
                                            />
                                            <MeasureUnitAutocomplete
                                                onSelect={(value) =>
                                                    handleSubItemChange(
                                                        orange.elementId,
                                                        subItem.elementId,
                                                        'measureUnit',
                                                        value
                                                    )
                                                }
                                                value={subItem.measureUnit || ''}
                                                disabled={isEditing !== true}
                                                style={styles.select}
                                            />
                                            <TextField
                                                placeholder="Цена"
                                                variant="outlined"
                                                size="small"
                                                style={styles.inputFieldSmall}
                                                value={subItem.price || ''}
                                                onChange={(e) => {
                                                    let newValue = e.target.value.replace(/[^0-9.,]/g, ''); // Оставляем только цифры, точку и запятую
                                                    newValue = newValue.replace(/,/g, '.'); // Заменяем запятую на точку (единый формат)

                                                    // Проверка: только одна десятичная точка
                                                    if ((newValue.match(/\./g) || []).length > 1) {
                                                        return; // Не даём ввести вторую точку
                                                    }

                                                    handleSubItemChange(
                                                        orange.elementId,
                                                        subItem.elementId,
                                                        'price',
                                                        newValue
                                                    );
                                                }}
                                                disabled={isEditing !== true}
                                                InputProps={{
                                                    inputMode: 'decimal', // Мобильные устройства показывают цифровую клавиатуру с точкой
                                                }}
                                            />
                                            
                                            <IconButton
                                                color="error"
                                                onClick={() =>
                                                    handleRemoveSubItem(orange.elementId, subItem.elementId)
                                                }
                                                disabled={isEditing !== true}
                                            >
                                                <Remove />
                                            </IconButton>
                                        </div>

                                        {/* Карточки изменений для подкатегории */}
                                        {changes
                                            .filter(
                                                (change) =>
                                                    (change.updatedFields?.nodeId === subItem.nodeId || // Для изменений подкатегории
                                                        change.parentId === subItem.elementId) && // Для изменений, связанных с конкретной подкатегорией
                                                    change.elementId !== null // Исключаем карточки на добавление
                                            )
                                            .map((change, index) => (
                                                <ChangeCard
                                                    key={`${subItem.nodeId}-${index}`}
                                                    operation={change.operation}
                                                    data={change}
                                                    url={url}
                                                    authToken={authToken}
                                                    agreementId={agreementId}
                                                    userId={userId}
                                                    firstId={initiatorId}
                                                    secondId={receiverId}
                                                />
                                            ))}

                                    </div>

                                ))}

                                {/* Карточки изменений на добавление подкатегорий */}
                                {changes
                                    .filter(
                                        (change) =>
                                            change.operation === 'add' && // Только карточки на добавление
                                            change.elementId === null && // Карточки без elementId
                                            change.parentNodeId === orange.nodeId // Карточки для текущей категории
                                    )
                                    .map((change, index) => (
                                        <ChangeCard
                                            key={`${orange.nodeId}-add-${index}`}
                                            operation={change.operation}
                                            data={change}
                                            url={url}
                                            authToken={authToken}
                                            agreementId={agreementId}
                                            userId={userId}
                                            firstId={initiatorId}
                                            secondId={receiverId}
                                        />
                                    ))}

                            </React.Fragment>
                        ))}
                        {/* проблемный Блок */}
                        {changes
                            .filter(
                                (change) =>
                                    change.operation === 'add' &&
                                    change.parentNodeId === null && // Карточки без elementId
                                    change.parentNodeId === null // Карточки для новых элементов (без родителя)
                            )
                            .map((change, index) => (
                                <ChangeCard
                                    key={`${change.nodeId}-add-${index}`}
                                    operation={change.operation}
                                    data={change}
                                    url={url}
                                    authToken={authToken}
                                    agreementId={agreementId}
                                    userId={userId}
                                    firstId={initiatorId}
                                    secondId={receiverId}
                                />
                            ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '20px' }}>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleAddOrangeItem()}
                            style={{ backgroundColor: 'orange', marginRight: '10px' }}
                            disabled={isEditing !== true}
                        >
                            Добавить категорию
                        </Button>

                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleSave}
                            disabled={isEditing !== true}
                        >
                            Сохранить
                        </Button>

                        {/* console.log('Estimate:', estimate); */}
                        {Array.isArray(estimate) && estimate.length > 0 ? <DocumentManager agreementId={agreementId} firstId={initiatorId} secondId={receiverId} /> : null}

                    </div>
                </div>
            </Drawer>
        </>
    );


};

const styles = {
    // Стиль для контейнера категории (оранжевый блок)
    orangeBox: {
        backgroundColor: '#ffa726',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        border: '1px solid #e65100',
    },
    // Заголовок категории
    orangeHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '15px',
    },
    // Стиль для подкатегории (белый блок)
    whiteBox: {
        backgroundColor: '#fff',
        padding: '15px',
        borderRadius: '8px',
        marginTop: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e0e0e0',
    },
    // Стиль для текстовых полей
    inputField: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    // Стиль для маленьких текстовых полей (например, объём работ, цена)
    inputFieldSmall: {
        flex: 0.2,
        backgroundColor: '#fff',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    // Стиль для выпадающего списка (единицы измерения)
    select: {
        flex: 0.2,
        backgroundColor: '#fff',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    // Стиль для кнопки добавления
    addButton: {
        backgroundColor: '#fff',
        color: '#ffa726',
        border: '1px solid #ffa726',
        borderRadius: '4px',
        '&:hover': {
            backgroundColor: '#ffa726',
            color: '#fff',
        },
    },
    // Стиль для заголовков (например, Node ID)
    headerText: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '10px',
    },
    // Стиль для разделителя между элементами
    divider: {
        borderBottom: '1px solid #e0e0e0',
        margin: '15px 0',
    },
    // Стиль для карточек изменений
    changeCard: {
        backgroundColor: '#f5f5f5',
        padding: '10px',
        borderRadius: '6px',
        marginTop: '10px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e0e0e0',
    },
};

export default Builder;