import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import './ToastNotification.css';

const ToastNotification = ({ message, type = 'info', delay = 5000, show, onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => onClose(), delay);
            return () => clearTimeout(timer);
        }
    }, [show, delay, onClose]);

    return (
        <div className="toast-fixed-container">
            <ToastContainer position="top-end" className="p-3">
                <Toast show={show} onClose={onClose} bg={type}>
                    <Toast.Header>
                        <strong className="me-auto">{getToastTitle(type)}</strong>
                    </Toast.Header>
                    <Toast.Body>{message}</Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
};

// Вспомогательная функция для заголовков в зависимости от типа
const getToastTitle = (type) => {
    switch (type) {
        case 'success':
            return 'Успешно!';
        case 'warning':
            return 'Внимание!';
        case 'error':
            return 'Ошибка!';
        default:
            return 'Информация:';
    }
};

export default ToastNotification;