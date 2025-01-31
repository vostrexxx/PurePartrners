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
                <Box
                    sx={{
                        backgroundColor: '#333',
                        padding: '8px',
                        borderRadius: '4px',
                        overflowX: 'auto',
                    }}
                >
                    <Typography variant="body2" sx={{ color: '#ffa726' }}>
                        Название: {data.updatedFields?.subWorkCategoryName || 'Не указано'}
                    </Typography>

                    {/* Отображение подкатегорий, если они есть */}
                    {data.subSubCategories && data.subSubCategories.length > 0 && (
                        <Box sx={{ marginTop: '8px' }}>
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
                                                    <Typography variant="body2" sx={{ color: '#fff' }}>
                                                        Node ID: {subCategory.nodeId || 'Не указано'}
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
                <Box
                    sx={{
                        backgroundColor: '#333',
                        padding: '8px',
                        borderRadius: '4px',
                        overflowX: 'auto',
                    }}
                >
                    <Typography variant="body2" sx={{ color: '#fff', marginBottom: '4px' }}>
                        Наименование: {data.updatedFields?.subSubWorkCategoryName || 'Не указано'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#fff', marginBottom: '4px' }}>
                        Объем работ: {data.updatedFields?.workAmount || 'Не указано'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#fff', marginBottom: '4px' }}>
                        Единица измерения: {data.updatedFields?.measureUnit || 'Не указано'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#fff', marginBottom: '4px' }}>
                        Цена: {data.updatedFields?.price || 'Не указано'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#fff', marginBottom: '4px' }}>
                        Node ID: {data.updatedFields?.nodeId || 'Не указано'}
                    </Typography>
                </Box>
            );
        }
    };

    return (
        <Box
            sx={{
                backgroundColor: '#000',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)',
            }}
        >
            <Typography
                variant="h6"
                sx={{
                    backgroundColor: operation === 'add' ? '#ff9800' : operation === 'delete' ? '#f44336' : '#2196f3',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '8px 8px 0 0',
                    textTransform: 'uppercase',
                }}
            >
                {operation === 'add' ? 'Добавление' : operation === 'delete' ? 'Удаление' : 'Обновление'}
            </Typography>
            {renderContent()}
            {Number(userId) !== data.initiatorId && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
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