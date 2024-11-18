import React, { useState, useEffect } from 'react';
import Agreement from '../../Previews/Agreement';
import { useProfile } from '../../Context/ProfileContext';

const getAuthToken = () => localStorage.getItem('authToken');
let url = localStorage.getItem('url');

const SentAgreement = () => {
    const [agreements, setAgreements] = useState([]);
    const { isSpecialist } = useProfile();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${url}/agreement/sent`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}`,
                    }
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status}`);
                }

                const data = await response.json();
                setAgreements(data.agreements); // Устанавливаем данные
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            }
        };

        fetchData();
    }, [isSpecialist]); // Зависимость от isSpecialist, если это важно


    return (
        <div>
            <h2>На что откликнулся пользователь</h2>
            {agreements.length > 0 ? (
                agreements.map((item, index) => (
                    <Agreement 
                        mode={item.mode} 
                        initiatorItemId={item.initiatorItemId} 
                        receiverId={item.receiverId}
                        receiverItemId={item.receiverItemId}
                        status={item.status}
                        comment={item.comment}
                        updateDate={item.updateDate}
                        key={index}
                    />
                ))
            ) : (
                <p>Нет отправленных откликов</p>
            )}
        </div>
    );
};

export default SentAgreement;
