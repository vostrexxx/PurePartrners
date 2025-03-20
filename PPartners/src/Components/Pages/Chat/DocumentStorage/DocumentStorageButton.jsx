import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaFile } from 'react-icons/fa';
import DocumentStorageModalWnd from './DocumentStorageModalWnd';
import StageModalWnd from '../StageModalWnd';

const DocumentStorageButton = ({ agreementId, stage }) => {

    const [isModalOpen, setIsModalOpen] = useState(false); // Состояние для управления видимостью модального окна

    const handleButtonClick = () => {
        setIsModalOpen(true); // Открываем модальное окно при клике на кнопку
    };

    const handleCloseModal = () => {
        setIsModalOpen(false); // Закрываем модальное окно
    };

    return (
        <>
            <Button variant='success' onClick={handleButtonClick}>
                <FaFile />
            </Button>
            <DocumentStorageModalWnd agreementId={agreementId} isOpen={isModalOpen} onClose={handleCloseModal} stage={stage} />
        </>
    );
};

export default DocumentStorageButton;