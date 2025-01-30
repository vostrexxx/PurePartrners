import React, { useState, useEffect } from 'react';
import { TbDeviceSdCard } from 'react-icons/tb';
import { useNavigate, useLocation } from 'react-router-dom';

const RejectButton = ({ agreementId, status }) => {
    const navigate = useNavigate();

    const getAuthToken = () => localStorage.getItem('authToken');
    const url = localStorage.getItem('url');
    const handleReject = async () => {

        const bodyData = {
            newStatus: "Отклонено",
            agreementId,
        };
        if (window.confirm("Вы уверены, что хотите отклонить соглашение, дальнее взаимодействие по нему станет невозможным")){
            
            if (status === 'Переговоры'){
                try {
                    const response = await fetch(`${url}/agreement`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getAuthToken()}`,
                        },
                        body: JSON.stringify(bodyData),
                    });
    
                    if (!response.ok) {
                        throw new Error(`Ошибка при отклонении: ${response.status}`);
                    }
                    const data = await response.json();
    
                } catch (error) {
                    
                }
            } else {
                alert(`Вы не можете отклонить соглашение, так как оно имеет статус: ${status}`)
            }

            
        }
    };

    return (
        <button onClick={handleReject}>Отклонить</button>
    );
};

export default RejectButton;
