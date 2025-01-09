import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, Select, MenuItem, IconButton, Drawer } from '@mui/material';
import { Add, Remove, Menu } from '@mui/icons-material';
import ChangeCard from './ChangeCard';

const Builder = ({ agreementId }) => {
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

    const [triggerGet, setTriggerGet] = useState(false);


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
    }, [agreementId, authToken, triggerGet]);

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

    // Debug для isEditing
    useEffect(() => {
        console.log('isEditing updated:', isEditing);
    }, [isEditing]);


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
                    setEstimate([]); // Новый билдер
                    setOriginalEstimate([]);
                    setIsNewBuilder(true);
                } else {
                    const parsedEstimate = data.estimate.map((item, index) => ({
                        nodeId: `${index + 1}`,
                        elementId: item.elementId,
                        type: 1,
                        subWorkCategoryName: item.subWorkCategoryName,
                        subSubWorkCategories: item.subSubWorkCategories.map((subItem, subIndex) => ({
                            ...subItem,
                            elementId: subItem.elementId,
                            nodeId: `${index + 1}.${subIndex + 1}`,
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
    }, [agreementId, authToken, url, triggerGet]);

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
                const subChanges = generateSubCategoryChanges(originalItem.subSubWorkCategories, item.subSubWorkCategories, item.elementId);
                changes.push(...subChanges);
            }
        });

        return changes;
    };

    const generateSubCategoryChanges = (originalSub, updatedSub, parentId) => {
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
            });
        });

        // Удалённые подкатегории
        const removed = originalSub.filter(sub => !updatedSub.some(upd => upd.elementId === sub.elementId));
        removed.forEach(sub => {
            subChanges.push({
                operation: 'delete',
                type: 2,
                elementId:sub.elementId,
                updatedFields: {
                    subSubWorkCategoryName: sub.subSubWorkCategoryName,
                    workAmount: sub.workAmount,
                    measureUnit: sub.measureUnit,
                    price: sub.price,
                    nodeId: sub.nodeId,
                },
                parentId,
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
                    });
                }
            }
        });

        return subChanges;
    };


    const handleFormated = async () => {
        const response = await fetch(`${url}/document/estimate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ estimate, agreementId }),
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
                    body: JSON.stringify({ estimate, agreementId }),
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сохранения сметы: ${response.status}`);
                }

                alert('Смета успешно сохранена!');
                setOriginalEstimate([...estimate]);
                setIsNewBuilder(false);
            } else {
                const changes = generateChanges(originalEstimate, estimate);
                const response = await fetch(`${url}/categories/changes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({ changes, agreementId, initiatorId:userId }),
                });

                if (!response.ok) {
                    throw new Error(`Ошибка обновления сметы: ${response.status}`);
                }

                alert('Изменения успешно сохранены!');
                setOriginalEstimate([...estimate]);

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
                setTriggerGet(!triggerGet)
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
                    >
                        Редактировать
                    </Button>
    
                    <div>
                        {estimate.map((orange) => (
                            <React.Fragment key={orange.nodeId}>
                                <div style={styles.orangeBox}>
                                    <div style={styles.orangeHeader}>
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
                                    <p>Node ID: {orange.nodeId}</p>
                                    {orange.subSubWorkCategories.map((subItem) => (
                                        <div key={subItem.nodeId} style={styles.whiteBox}>
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
                                                onChange={(e) =>
                                                    handleSubItemChange(
                                                        orange.elementId,
                                                        subItem.elementId,
                                                        'workAmount',
                                                        e.target.value
                                                    )
                                                }
                                                disabled={isEditing !== true}
                                            />
                                            <Select
                                                value={subItem.measureUnit || ''}
                                                onChange={(e) =>
                                                    handleSubItemChange(
                                                        orange.elementId,
                                                        subItem.elementId,
                                                        'measureUnit',
                                                        e.target.value
                                                    )
                                                }
                                                style={styles.select}
                                                disabled={isEditing !== true}
                                            >
                                                <MenuItem value="">Выбрать...</MenuItem>
                                                <MenuItem value="option1">м2</MenuItem>
                                                <MenuItem value="option2">м3</MenuItem>
                                                <MenuItem value="option3">мп</MenuItem>
                                            </Select>
                                            <TextField
                                                placeholder="Цена"
                                                variant="outlined"
                                                size="small"
                                                style={styles.inputFieldSmall}
                                                value={subItem.price || ''}
                                                onChange={(e) =>
                                                    handleSubItemChange(
                                                        orange.elementId,
                                                        subItem.elementId,
                                                        'price',
                                                        e.target.value
                                                    )
                                                }
                                                disabled={isEditing !== true}
                                            />
                                            <p>Node ID: {subItem.nodeId}</p>
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
                                    ))}
                                </div>
    
                                {/* Карточки для изменений */}
                                {changes
                                    .filter(
                                        (change) =>
                                            change.updatedFields?.nodeId === orange.nodeId ||
                                            change.updatedFields?.parentId === orange.elementId
                                    )
                                    .map((change, index) => (
                                        <ChangeCard
                                            key={`${orange.nodeId}-${index}`}
                                            operation={change.operation}
                                            data={change}
                                            url={url}
                                            authToken={authToken}
                                            agreementId={agreementId}
                                            userId={userId}
                                            onTrigger={() => setTriggerGet(!triggerGet)} // Передаем функцию изменения триггера
                                        />
                                    ))}
                            </React.Fragment>
                        ))}
    
                        {/* Карточки для добавления новых рыжих элементов */}
                        {changes
                            .filter(
                                (change) =>
                                    !change.updatedFields?.parentId &&
                                    !estimate.some((orange) => orange.nodeId === change.updatedFields?.nodeId)
                            )
                            .map((change, index) => (
                                <ChangeCard
                                    key={`new-orange-${index}`}
                                    operation={change.operation}
                                    data={change}
                                    url={url}
                                    authToken={authToken}
                                    agreementId={agreementId}
                                    userId={userId}
                                    onTrigger={() => setTriggerGet(!triggerGet)} // Передаем функцию изменения триггера
                                />
                            ))}
                    </div>
    
                    <div style={{ textAlign: 'center', marginTop: '20px'  }}>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleAddOrangeItem('Новая категория')}
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

                        <Button style={{marginLeft: '10px'}}
                            variant="contained"
                            color="secondary"
                            onClick={handleFormated}
                        >
                            Сформировать смету
                        </Button>
                    </div>
                </div>
            </Drawer>
        </>
    );
    

};

const styles = {
    orangeBox: {
        backgroundColor: 'orange',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '24px', // Увеличенный отступ между категориями
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Легкая тень
    },
    orangeHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px', // Чуть больше отступов между элементами
    },
    whiteBox: {
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '5px',
        marginTop: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    inputField: {
        flex: 1,
    },
    inputFieldSmall: {
        flex: 0.2,
    },
    select: {
        flex: 0.2,
    },
    addButton: {
        backgroundColor: 'white',
        color: 'orange',
        border: '1px solid orange',
    },
};

export default Builder;