import React, { useState, useEffect } from 'react';
import Agreement from '../../Previews/Agreement';
import { useProfile } from '../../Context/ProfileContext';

const getAuthToken = () => localStorage.getItem('authToken');
let url = localStorage.getItem('url');

const ReceivedAgreement = () => {
    const [agreements, setAgreements] = useState([]);
    const { isSpecialist } = useProfile();

    const [trigger, setTrigger] = useState(false);
    
    useEffect(() => {
        const fetchData = async () => {
            try {

                const params = new URLSearchParams({
                    mode: isSpecialist ? 1 : 0,
                });
                const response = await fetch(`${url}/agreement/received?${params.toString()}`, {
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
                setAgreements(data.agreements);
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            }
        };

        fetchData();
    }, [isSpecialist, trigger]);

    const toggleTrigger = () => {
        setTrigger((prev) => !prev);
    };

    return (
        <div>
            <h2>На что вам откликнулись</h2>
            {agreements.length > 0 ? (
                agreements.map((item, index) => (
                    <Agreement 
                        id={item.id} 
                        mode={item.mode} 
                        initiatorId={item.initiatorId} 
                        initiatorItemId={item.initiatorItemId} 
                        receiverId={item.receiverId}
                        receiverItemId={item.receiverItemId}
                        localizedStatus={item.localizedStatus}
                        comment={item.comment}
                        updateDate={item.updateDate}
                        key={index}
                        isReceiver={true}
                        chatId={item.chatId}
                        isSpecialist={isSpecialist}
                        onTrigger={toggleTrigger}
                    />
                ))
            ) : (
                <p>Нет откликов</p>
            )}
        </div>
    );
};

export default ReceivedAgreement;
