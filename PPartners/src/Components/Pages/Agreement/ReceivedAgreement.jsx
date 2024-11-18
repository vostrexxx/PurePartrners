import React, { useState, useEffect } from 'react';

const getAuthToken = () => localStorage.getItem('authToken');
let url = localStorage.getItem('url');

const ReceivedAgreement = () => {

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${url}/agreement/received`, {
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
                // console.log(data)
                
                // if (data.success === 1 && data.questionnaireInfo) {
                //     setQuestionnaire(data.questionnaireInfo);
                // } else {
                //     setError('Информация об анкете не найдена');
                // }
            } catch (error) {
                // setError(`Ошибка при выполнении запроса: ${error.message}`);
            } finally {
                // setLoading(false);
            }
        };

        fetchData();
    }, []);


    return (
        <div>
             <h2>Кто откликнулся на пользователя</h2>
        </div>
    );
};

export default ReceivedAgreement;