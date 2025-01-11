import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const StageModalWnd = ({ isOpen, onClose, mode, stage }) => {
    if (!stage) return null; // Если stage не передан, ничего не рендерим
    const authToken = localStorage.getItem('authToken');
    const url = localStorage.getItem('url');

    const handleChangeStageStatus = async (stageStatus) => {
        try {
            const response = await fetch(`${url}/stages/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ elementId: stage.id, stageStatus }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка сети: ${response.status}`);
            }

            const data = await response.json();

        } catch (error) {
            // console.error('Ошибка при сохранении этапов:', error.message);
            alert('Ошибка при смене статуса');
        }
    };

    // Функция для определения текста и стилей на основе статуса
    const renderStatus = (mode, stageStatus) => {
        switch (stageStatus) {
            case 'Не начато':
                if (mode === 'contractor') {
                    return <div>
                        <Typography color="textSecondary">Статус: Вы еще не приступили к работам</Typography>
                        <Button onClick={()=>handleChangeStageStatus("В процессе")} variant="contained" color="primary">
                            Приступить
                        </Button>
                    </div> 
                } else if (mode === 'customer') {
                    return <div>
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
                        <Button onClick={()=>handleChangeStageStatus("В ожидании подтверждения")} variant="contained" color="primary">
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
                            <Button onClick={()=>handleChangeStageStatus("Подтверждено")} variant="contained" color="primary">
                                Подтвердить выполнение работ
                            </Button>
                        </div> 
                } else {
                    return <div>
                        <Typography color="textSecondary">Ошибка!</Typography>
                    </div>
                };
                
            case 'Подтверждено':
                if (mode === 'contractor') {
                    return <div>
                        <Typography color="textSecondary">Статус: Выполнение всех работ подтверждено</Typography>
                    </div> 
                } else if (mode === 'customer') {
                    return <div>
                            <Typography color="textSecondary">Статус: Заказчик подтвердил умпешность выполнение всех работ</Typography>
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
                <Typography id="modal-title" variant="h6" component="h2" color='black'>
                    {mode === 'contractor' ? 'Статус для подрядчика' : 'Статус для заказчика'}
                </Typography>

                <Box sx={{ mt: 2 }}>
                    {renderStatus(mode, stage.stageStatus)} {/* Отображаем статус через функцию */}
                </Box>

                <Box sx={{ mt: 4, textAlign: 'right' }}>
                    <Button onClick={onClose} variant="contained" color="primary">
                        Закрыть
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default StageModalWnd;
