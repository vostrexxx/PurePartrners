import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const StageModalWnd = ({ isOpen, onClose, mode, stage }) => {
    if (!stage) return null; // Если stage не передан, ничего не рендерим

    return (
        <Modal open={isOpen} onClose={onClose} aria-labelledby="modal-title" aria-describedby="modal-description">
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'black',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                    minWidth: 300,
                }}
            >
                <Typography id="modal-title" variant="h6" component="h2">
                    {mode === 'contractor' ? 'Статус для подрядчика' : 'Статус для заказчика'}
                </Typography>
                <Typography id="modal-description" sx={{ mt: 2 }}>
                    <strong>Название этапа:</strong> {stage.name}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    <strong>Статус:</strong> {stage.stageStatus}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    <strong>Утвержден заказчиком:</strong> {stage.isCustomerApproved ? 'Да' : 'Нет'}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    <strong>Утвержден подрядчиком:</strong> {stage.isContractorApproved ? 'Да' : 'Нет'}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    <strong>Сумма этапа:</strong>{' '}
                    {stage.children.reduce((sum, child) => sum + (child.totalPrice || 0), 0)} руб.
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    <strong>Подэтапы:</strong>
                </Typography>
                <ul>
                    {stage.children.map((child, index) => (
                        <li key={child.id}>
                            {index + 1}. {child.subWorkCategoryName} — {child.totalPrice || 'Цена не указана'} руб.
                        </li>
                    ))}
                </ul>
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
