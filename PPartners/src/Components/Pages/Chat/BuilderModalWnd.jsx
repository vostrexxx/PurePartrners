import React, { useState } from 'react';
import { Modal, Box, Typography, Button, TextField } from '@mui/material';

const BuilderModalWnd = ({ isOpen, onClose, agreementId, }) => {
    const authToken = localStorage.getItem('authToken');
    const url = localStorage.getItem('url');
    const [file, setFile] = useState(null); // Состояние для файла
    const [error, setError] = useState(''); // Состояние для ошибок

    // Обработчик загрузки файла
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
            if (fileExtension !== 'xls' && fileExtension !== 'xlsx') {
                setError('Можно загрузить только файлы формата Excel (.xls, .xlsx)');
                setFile(null); // Сбрасываем файл
            } else {
                setError('');
                setFile(selectedFile); // Устанавливаем файл, если формат корректный
            }
        }
    };

    // Обработчик отправки файла
    const handleSubmit = async () => {
        if (!file) {
            setError('Пожалуйста, выберите файл.');
            return;
        }

        const formData = new FormData();
        formData.append('estimate', file);
        formData.append('agreementId', agreementId);

        try {
            const response = await fetch(`${url}/categories/user-estimate`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Ошибка при отправке файла: ${response.status}`);
            }

            // Успешная отправка
            alert('Файл успешно отправлен');
            setFile(null); // Сбрасываем файл после успешной отправки
            onClose(); // Закрываем модальное окно

        } catch (error) {
            setError(`Не удалось отправить файл: ${error.message}`);
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
                    minWidth: 400,
                }}
            >
                <Typography id="modal-title" variant="h6" component="h2" color="black">
                    Загрузите смету согласно шаблону
                </Typography>
                {/* <Typography id="modal-description" variant="body1" color="black" sx={{ mt: 2 }}>
                    Идентификатор соглашения: {agreementId}
                </Typography> */}

                <Box sx={{ mt: 3 }}>
                    <input
                        type="file"
                        accept=".xls,.xlsx"
                        onChange={handleFileChange}
                        style={{ marginBottom: '10px' }}
                    />
                    {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
                </Box>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={handleSubmit} variant="contained" color="primary" disabled={!file}>
                        Отправить
                    </Button>
                    <Button onClick={onClose} variant="outlined" color="secondary">
                        Закрыть
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default BuilderModalWnd;
