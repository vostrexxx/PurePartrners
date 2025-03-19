import React, { useState, useEffect, useRef } from 'react';
import { TextField, Select, MenuItem, IconButton, Drawer } from '@mui/material';
import { Add, Remove, Menu } from '@mui/icons-material';
import ChangeCard from './ChangeCard';
import BuilderModalWnd from './BuilderModalWnd';
import DocumentManager from './DocumentManager';
import { EventSourcePolyfill } from 'event-source-polyfill';
import MeasureUnitAutocomplete from '../SearchComponent/MeasureUnitAutocomplete';
import { Container, Form, InputGroup, Button, Image, Row, Col } from 'react-bootstrap';
import { Delete } from '@mui/icons-material'; // Импортируем иконку корзины
import { FaFileWord, FaFileExcel, FaFilePdf, FaFileAlt, FaEdit, FaSave, FaMinus } from 'react-icons/fa';
import { FaPlus } from "react-icons/fa";
import { useToast } from '../../Notification/ToastContext'

const Builder = ({ agreementId, initiatorId, receiverId }) => {
    const showToast = useToast();
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
                    // alert("Смета редактируется другим пользователем.");
                    showToast("Смета редактируется другим пользователем", "warning")
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
                showToast("Смета редактируется другим пользователем.", "warning")
                // alert("Смета редактируется другим пользователем.");
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
            // console.error('Ошибка обработки редактирования:', error);
            // alert('Не удалось переключить состояние редактирования.');
            showToast('Не удалось переключить состояние редактирования', 'danger')
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
            // subWorkCategoryName: initialName,
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

                // alert('Смета успешно сохранена!');
                showToast('Смета успешно сохранена', 'success')
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

                    // alert('Изменения успешно сохранены!');
                    showToast('Изменения успешно сохранены', "success");

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
            // alert('Не удалось сохранить изменения.');
            showToast('Не удалось сохранить изменения', 'danger')
        }
    };

    return (
        <Container fluid className="p-3 bg-light" style={{
            height: '80vh',
            overflowY: 'auto',
            borderRadius: '5px', // Скругление краёв
        }}>
            <Row className="align-items-center">
                <Col className="text-center">
                    <h2>Редактор сметы</h2>
                </Col>
                <Col xs="auto">
                    <Button variant="success" onClick={handleOpenModal}>
                        <FaFileExcel /> {/* Иконка файла */}
                    </Button>
                </Col>
            </Row>
            {/* Кнопки управления */}
            <div className="d-flex flex-wrap justify-content-center mb-4 gap-2">

                <Button
                    variant="primary"
                    onClick={handleEdit}
                    hidden={isEditing}
                    className="fixed-button"
                    style={styles.fixedButton}
                >
                    {/* Редактировать */}
                    <FaEdit />
                </Button>

                <Button
                    variant="success"
                    onClick={handleSave}
                    hidden={!isEditing}
                    className="fixed-button"
                    style={styles.fixedButton}
                >
                    {/* Сохранить */}
                    <FaSave />
                </Button>



            </div>

            <BuilderModalWnd isOpen={modalOpen} onClose={closeModal} agreementId={agreementId} />

            {/* Смета */}
            <div className="mb-4">
                {estimate.map((orange) => (
                    <div key={orange.nodeId} className="p-3 mb-4 bg-warning rounded shadow">
                        {/* Категория */}
                        <div className="d-flex flex-nowrap align-items-center gap-3">
                            <strong>{orange.nodeId}</strong>
                            <TextField
                                placeholder="Введите наименование категории"
                                size="small"
                                value={orange.subWorkCategoryName}
                                onChange={(e) => handleOrangeTextChange(orange.elementId, e.target.value)}
                                disabled={!isEditing}
                                className="flex-fill"
                            />
                            <IconButton
                                variant="danger"
                                onClick={() => handleRemoveOrangeItem(orange.elementId)}
                                disabled={!isEditing}
                                color="error" // Цвет для кнопки удаления (красный)
                            >
                                <Delete /> {/* Иконка минуса */}
                            </IconButton>

                        </div>

                        {/* Карточки изменений для категории */}
                        {changes
                            .filter(
                                (change) =>
                                    (change.operation === 'update' || change.operation === 'delete') &&
                                    change.updatedFields.nodeId === orange.nodeId
                            )
                            .map((change, index) => (
                                <ChangeCard
                                    key={`${orange.nodeId}-change-${index}`}
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

                        {/* Подкатегории */}
                        {orange.subSubWorkCategories.map((subItem) => (
                            <div key={subItem.nodeId} className="p-2 mb-3 mt-2 bg-white rounded border">
                                {/* Поля ввода и кнопки */}
                                <div className="d-flex flex-column gap-2">
                                    {/* Наименование подкатегории */}
                                    <TextField
                                        label="Наименование подкатегории"
                                        placeholder="Наименование подкатегории"
                                        size="small"
                                        value={subItem.subSubWorkCategoryName || ''}
                                        onChange={(e) =>
                                            handleSubItemChange(orange.elementId, subItem.elementId, 'subSubWorkCategoryName', e.target.value)
                                        }
                                        disabled={!isEditing}
                                        className="w-100"
                                        multiline
                                        minRows={1}
                                        maxRows={4}
                                    />

                                    {/* Группа полей: Объем, Ед. изм, Цена */}
                                    <div className="d-flex flex-wrap gap-2">
                                        <TextField
                                            // label="Объём "
                                            placeholder="Объем"
                                            size="small"
                                            label="Объём работ"
                                            value={subItem.workAmount || ''}
                                            onChange={(e) =>
                                                handleSubItemChange(orange.elementId, subItem.elementId, 'workAmount', e.target.value.replace(/[^0-9.,]/g, ''))
                                            }
                                            disabled={!isEditing}
                                            className="flex-grow-1"
                                        />

                                        <TextField
                                            placeholder="Ед. изм"
                                            size="small"
                                            label="Ед. изм"
                                            value={subItem.measureUnit || ''}
                                            onChange={(e) => handleSubItemChange(orange.elementId, subItem.elementId, 'measureUnit', e.target.value)}
                                            disabled={!isEditing}
                                            className="flex-grow-1"
                                        />

                                        <TextField
                                            placeholder="Цена"
                                            label="Цена"
                                            size="small"
                                            value={subItem.price || ''}
                                            onChange={(e) =>
                                                handleSubItemChange(orange.elementId, subItem.elementId, 'price', e.target.value.replace(/[^0-9.,]/g, ''))
                                            }
                                            disabled={!isEditing}
                                            className="flex-grow-1"
                                        />
                                    </div>

                                    <Button
                                        variant="outline-danger"
                                        onClick={() => handleRemoveSubItem(orange.elementId, subItem.elementId)}
                                        disabled={!isEditing}
                                        color="error"
                                    >
                                        Удалить
                                    </Button>
                                </div>

                                {/* Карточки изменений */}
                                <div className="mt-2">
                                    {changes
                                        .filter(
                                            (change) =>
                                                (change.updatedFields?.nodeId === subItem.nodeId || change.parentId === subItem.elementId) &&
                                                change.operation !== 'add'
                                        )
                                        .map((change, index) => (
                                            <div key={`${subItem.nodeId}-sub-change-${index}`} className="change-card-desktop">
                                                <ChangeCard
                                                    operation={change.operation}
                                                    data={change}
                                                    url={url}
                                                    authToken={authToken}
                                                    agreementId={agreementId}
                                                    userId={userId}
                                                    firstId={initiatorId}
                                                    secondId={receiverId}
                                                />
                                            </div>
                                        ))}
                                </div>
                            </div>


                        ))}
                        <Button
                            variant="success"
                            className='w-100 mt-2'
                            // style={{ width: "100%" }}
                            onClick={() => handleAddSubItem(orange.elementId)}
                            hidden={!isEditing}
                            color="primary" // Цвет для кнопки добавления (синий)
                        >
                            Добавить подкатегорию
                        </Button>
                    </div>
                ))}

                {/* Карточки для новых элементов (без категории) */}
                {changes
                    .filter(
                        (change) =>
                            change.operation === 'add' &&
                            change.parentNodeId === null
                    )
                    .map((change, index) => (
                        <ChangeCard
                            key={`new-add-${index}`}
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

            <Button
                variant="warning"
                style={{ width: "100%" }}
                onClick={handleAddOrangeItem}
                hidden={!isEditing}>
                Добавить категорию
            </Button>


            {/* Документ менеджер */}
            {
                Array.isArray(estimate) && estimate.length > 0 && (
                    <DocumentManager agreementId={agreementId} firstId={initiatorId} secondId={receiverId} />
                )
            }

            {/* Стили для адаптива */}
            <style>
                {`
                @media (max-width: 768px) {
                    .input-sm {
                        width: 100px;
                    }
                    .flex-fill {
                        flex: 1;
                        min-width: 150px;
                    }
                }
    
                .bg-warning {
                    background-color: #ffc107;
                }
    
                .p-2 {
                    padding: 0.5rem;
                }
    
                .rounded {
                    border-radius: 8px;
                }
                `}
            </style>
        </Container >
    );
};



export default Builder;

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