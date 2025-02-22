import React from 'react';
import { IconButton, Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import { Check, Close } from '@mui/icons-material';

const ChangeCard = ({ operation, data, url, authToken, agreementId, userId, firstId, secondId }) => {
    const handleApprove = async () => {
        try {
            const response = await fetch(`${url}/categories/estimate`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({ changes: data, agreementId, firstId, secondId }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка применения изменения: ${response.status}`);
            }

            alert('Изменение успешно одобрено!');
        } catch (error) {
            console.error('Ошибка применения изменения:', error);
            alert('Не удалось одобрить изменение.');
        }
    };

    const handleReject = async () => {
        try {
            const params = new URLSearchParams({ id: data.id, firstId, secondId });
            const response = await fetch(`${url}/categories/changes?${params.toString()}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка отклонения изменения: ${response.status}`);
            }

            alert('Изменение успешно отклонено!');
        } catch (error) {
            console.error('Ошибка отклонения изменения:', error);
            alert('Не удалось отклонить изменение.');
        }
    };

    const renderContent = () => {
        if (data.type === 1) {
            // Отображаем название категории и подкатегории, если они есть
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Typography variant="body2" sx={{ color: '#ffa726' }}>
                        Название: {data.updatedFields?.subWorkCategoryName || 'Не указано'}
                    </Typography>

                    {/* Отображение подкатегорий, если они есть */}
                    {data.subSubCategories && data.subSubCategories.length > 0 && (
                        <Box>
                            <Typography variant="body2" sx={{ color: '#ffa726' }}>
                                Подкатегории:
                            </Typography>
                            <List sx={{ padding: '0' }}>
                                {data.subSubCategories.map((subCategory) => (
                                    <ListItem key={subCategory.elementId} sx={{ padding: '0', marginLeft: '16px' }}>
                                        <ListItemText
                                            primary={subCategory.subSubWorkCategoryName}
                                            secondary={
                                                <>
                                                    <Typography variant="body2" sx={{ color: '#fff' }}>
                                                        Объем работ: {subCategory.workAmount || 'Не указано'}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#fff' }}>
                                                        Единица измерения: {subCategory.measureUnit || 'Не указано'}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#fff' }}>
                                                        Цена: {subCategory.price || 'Не указано'}
                                                    </Typography>
                                                </>
                                            }
                                            sx={{ color: '#fff' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                </Box>
            );
        } else if (data.type === 2) {
            // Отображаем все поля для белых элементов
            return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {data.updatedFields.subSubWorkCategoryName && (
                        <Typography variant="body2" sx={{ color: '#fff' }}>
                            Наименование: {data.updatedFields.subSubWorkCategoryName}
                        </Typography>
                    )}
                    {data.updatedFields.workAmount && (
                        <Typography variant="body2" sx={{ color: '#fff' }}>
                            Объем работ: {data.updatedFields.workAmount}
                        </Typography>
                    )}
                    {data.updatedFields.measureUnit && (
                        <Typography variant="body2" sx={{ color: '#fff' }}>
                            Единица измерения: {data.updatedFields.measureUnit}
                        </Typography>
                    )}
                    {data.updatedFields.price && (
                        <Typography variant="body2" sx={{ color: '#fff' }}>
                            Цена: {data.updatedFields.price}
                        </Typography>
                    )}
                </Box>
            );
        }
    };

    return (
        <Box
            sx={{
                backgroundColor: 'grey',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' }, // На маленьких экранах - колонка, на больших - строка
                alignItems: { xs: 'flex-start', sm: 'center' }, // Выравнивание по левому краю на маленьких экранах
                gap: '16px',
                margin: '10px',
            }}
        >
            {/* Наименование операции */}
            <Box
                sx={{
                    backgroundColor:
                        operation === 'add' ? '#ff9800' : operation === 'delete' ? '#f44336' : '#2196f3',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    textTransform: 'uppercase',
                    minWidth: '120px',
                    textAlign: 'center',
                }}
            >
                <Typography variant="h9">
                    {operation === 'add' ? 'Добавление' : operation === 'delete' ? 'Удаление' : 'Обновление'}
                </Typography>
            </Box>

            {/* Детали операции */}
            <Box sx={{ flex: 1 }}>
                {renderContent()}
            </Box>

            {/* Кнопки одобрения/отклонения */}
            {Number(userId) !== data.initiatorId && (
                <Box
                    sx={{
                        display: 'flex',
                        gap: '8px',
                        alignSelf: { xs: 'flex-start', sm: 'center' }, // Выравнивание кнопок на маленьких экранах
                        marginTop: { xs: '16px', sm: '0' }, // Отступ сверху на маленьких экранах
                    }}
                >
                    <IconButton color="error" onClick={handleReject}>
                        <Close />
                    </IconButton>
                    <IconButton color="success" onClick={handleApprove}>
                        <Check />
                    </IconButton>
                </Box>
            )}
        </Box>
    );
};

export default ChangeCard;