import React, { useState, useEffect } from 'react';
import { TextField, Button, Select, MenuItem, IconButton } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

const Builder = ({ agreementId }) => {
    const [estimate, setEstimate] = useState([]); // Текущее состояние
    const [originalEstimate, setOriginalEstimate] = useState([]); // Эталонное состояние
    const [changes, setChanges] = useState([]); // Массив изменений
    const [isNewBuilder, setIsNewBuilder] = useState(false); // Флаг для определения нового билдера
    const url = localStorage.getItem("url");
    const authToken = localStorage.getItem("authToken");

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
                    setIsNewBuilder(true); // Если массив пустой, это новый билдер
                } else {
                    const parsedEstimate = data.estimate.map((item, index) => ({
                        nodeId: `${index + 1}`, // Присваиваем порядковый номер
                        id: item.id,
                        subWorkCategoryName: item.subWorkCategoryName,
                        subSubWorkCategories: item.subSubWorkCategories.map((subItem, subIndex) => ({
                            ...subItem,
                            nodeId: `${index + 1}.${subIndex + 1}`, // Присваиваем подномер
                        })),
                    }));

                    setEstimate(parsedEstimate);
                    setOriginalEstimate(parsedEstimate); // Сохраняем эталонное состояние
                    setIsNewBuilder(false); // Это существующий билдер
                }
            } catch (error) {
                console.error('Ошибка загрузки сметы:', error);
            }
        };

        fetchEstimate();
    }, [agreementId, authToken, url]);

    // Пересчет nodeId
    const recalculateNodeIds = (estimateData) => {
        return estimateData.map((orange, index) => ({
            ...orange,
            nodeId: `${index + 1}`,
            subSubWorkCategories: orange.subSubWorkCategories.map((subItem, subIndex) => ({
                ...subItem,
                nodeId: `${index + 1}.${subIndex + 1}`,
            })),
        }));
    };

    // Функция для отслеживания изменений
    const trackChanges = (operation, type, id, updatedFields, parentId = null) => {
        setChanges((prevChanges) => [
            ...prevChanges,
            {
                type,
                operation,
                id,
                updatedFields,
                parentId,
            },
        ]);
    };

    // Добавление нового рыжего элемента
    const handleAddOrangeItem = () => {
        const newOrange = {
            id: Date.now(),
            nodeId: `${estimate.length + 1}`,
            subWorkCategoryName: '',
            subSubWorkCategories: [],
        };

        setEstimate((prev) => recalculateNodeIds([...prev, newOrange]));
        trackChanges('add', '1', newOrange.id, { subWorkCategoryName: '', agreementId });
    };

    // Удаление рыжего элемента
    const handleRemoveOrangeItem = (orangeId) => {
        const updatedEstimate = estimate.filter((orange) => orange.id !== orangeId);
        setEstimate(recalculateNodeIds(updatedEstimate));
        trackChanges('delete', '1', orangeId, {});
    };

    // Добавление белого элемента
    const handleAddSubItem = (orangeId) => {
        const updatedEstimate = estimate.map((orange) =>
            orange.id === orangeId
                ? {
                      ...orange,
                      subSubWorkCategories: [
                          ...orange.subSubWorkCategories,
                          {
                              id: Date.now(),
                              nodeId: `${orange.nodeId}.${orange.subSubWorkCategories.length + 1}`,
                              subSubWorkCategoryName: '',
                              workAmount: '',
                              measureUnit: '',
                              price: '',
                          },
                      ],
                  }
                : orange
        );

        setEstimate(recalculateNodeIds(updatedEstimate));
        const newSubItem = updatedEstimate
            .find((o) => o.id === orangeId)
            .subSubWorkCategories.slice(-1)[0];
        trackChanges('add', '2', newSubItem.id, { ...newSubItem, agreementId }, orangeId);
    };

    // Удаление белого элемента
    const handleRemoveSubItem = (orangeId, subItemId) => {
        const updatedEstimate = estimate.map((orange) =>
            orange.id === orangeId
                ? {
                      ...orange,
                      subSubWorkCategories: orange.subSubWorkCategories.filter((subItem) => subItem.id !== subItemId),
                  }
                : orange
        );

        setEstimate(recalculateNodeIds(updatedEstimate));
        trackChanges('delete', '2', subItemId, {}, orangeId);
    };

    // Обновление данных белого элемента
    const handleSubItemChange = (orangeId, subItemId, field, value) => {
        setEstimate(
            estimate.map((orange) =>
                orange.id === orangeId
                    ? {
                          ...orange,
                          subSubWorkCategories: orange.subSubWorkCategories.map((subItem) =>
                              subItem.id === subItemId ? { ...subItem, [field]: value } : subItem
                          ),
                      }
                    : orange
            )
        );
        trackChanges('update', '2', subItemId, { [field]: value, agreementId }, orangeId);
    };

    // Обновление имени рыжего элемента
    const handleOrangeTextChange = (orangeId, value) => {
        setEstimate(
            estimate.map((orange) => (orange.id === orangeId ? { ...orange, subWorkCategoryName: value } : orange))
        );
        trackChanges('update', '1', orangeId, { subWorkCategoryName: value, agreementId });
    };

    // Отправка данных
    const handleSubmit = async () => {
        try {
            if (isNewBuilder) {
                // Если это новый билдер, отправляем весь объект через POST
                const response = await fetch(`${url}/categories/estimate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({estimate, agreementId}),
                });

                if (response.ok) {
                    alert('Билдер успешно сохранен!');
                    setChanges([]); // Очищаем изменения
                } else {
                    alert('Ошибка сохранения билдера');
                }
            } else {
                // Если это существующий билдер, отправляем изменения через PUT
                const response = await fetch(`${url}/categories/estimate`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify(changes),
                });

                if (response.ok) {
                    alert('Изменения успешно сохранены!');
                    setChanges([]); // Очищаем изменения
                } else {
                    alert('Ошибка сохранения изменений');
                }
            }
        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
            alert('Ошибка при отправке данных');
        }
    };

    return (
        <div>
            {estimate.map((orange) => (
                <div key={orange.id} style={styles.orangeBox}>
                    <div style={styles.orangeHeader}>
                        <IconButton color="error" onClick={() => handleRemoveOrangeItem(orange.id)}>
                            <Remove />
                        </IconButton>
                        <TextField
                            placeholder="Введите наименование категории"
                            variant="outlined"
                            size="small"
                            style={styles.inputField}
                            value={orange.subWorkCategoryName}
                            onChange={(e) => handleOrangeTextChange(orange.id, e.target.value)}
                        />
                        <Button
                            variant="contained"
                            style={styles.addButton}
                            onClick={() => handleAddSubItem(orange.id)}
                        >
                            <Add />
                        </Button>
                    </div>
                    <p>Node ID: {orange.nodeId}</p>
                    {orange.subSubWorkCategories.map((subItem) => (
                        <div key={subItem.id} style={styles.whiteBox}>
                            <TextField
                                placeholder="Наименование подкатегории"
                                variant="outlined"
                                size="small"
                                style={styles.inputField}
                                value={subItem.subSubWorkCategoryName}
                                onChange={(e) =>
                                    handleSubItemChange(orange.id, subItem.id, 'subSubWorkCategoryName', e.target.value)
                                }
                            />
                            <TextField
                                placeholder="Объем работ"
                                variant="outlined"
                                size="small"
                                style={styles.inputField}
                                value={subItem.workAmount}
                                onChange={(e) =>
                                    handleSubItemChange(orange.id, subItem.id, 'workAmount', e.target.value)
                                }
                            />
                            <Select
                                value={subItem.measureUnit}
                                onChange={(e) =>
                                    handleSubItemChange(orange.id, subItem.id, 'measureUnit', e.target.value)
                                }
                                style={styles.select}
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
                                style={styles.inputField}
                                value={subItem.price}
                                onChange={(e) =>
                                    handleSubItemChange(orange.id, subItem.id, 'price', e.target.value)
                                }
                            />
                            <p>Node ID: {subItem.nodeId}</p>
                            <IconButton color="error" onClick={() => handleRemoveSubItem(orange.id, subItem.id)}>
                                <Remove />
                            </IconButton>
                        </div>
                    ))}
                </div>
            ))}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddOrangeItem}
                    style={{ backgroundColor: 'orange', marginRight: '10px' }}
                >
                    Добавить категорию
                </Button>
                <Button variant="contained" color="secondary" onClick={handleSubmit}>
                    Сохранить изменения
                </Button>
            </div>
        </div>
    );
};

const styles = {
    orangeBox: {
        backgroundColor: 'orange',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '20px',
    },
    orangeHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
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
    select: {
        flex: 1,
    },
    addButton: {
        backgroundColor: 'white',
        color: 'orange',
        border: '1px solid orange',
    },
};

export default Builder;
