import React, { useState, useEffect } from 'react';

const RejectButton = ({ agreementId }) => {
    const getAuthToken = () => localStorage.getItem('authToken');
    const url = localStorage.getItem('url');

    const handleReject = async () => {


        const bodyData = {
            newStatus: "Отклонено",
            agreementId,
        };
        // console.log(bodyData)
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
            console.log(data)
        } catch (error) {
        }
    };

    return (
        <button onClick={handleReject}>Отклонить</button>
    );
};

export default RejectButton;
