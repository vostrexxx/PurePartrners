import React, { useEffect, useState } from 'react';
import { useParams, useNavigate  } from 'react-router-dom';
import Chat from '../../Previews/Chat';
import TopBar from '../TopBar/TopBar'
import { useProfile } from '../../Context/ProfileContext';

const AllChatsPage = () => {
    const [chatPreviews, setChatPreviews] = useState([]);
    const getAuthToken = () => localStorage.getItem('authToken');
    let url = localStorage.getItem('url');
    const { isSpecialist } = useProfile();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params = new URLSearchParams({
                    isSpecialist: isSpecialist,
                });
    
                const response = await fetch(`${url}/chat/previews?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}`,
                    },
                });
    
                if (!response.ok) {
                    throw new Error(`Ошибка при загрузке данных: ${response.status}`);
                }
    
                const data = await response.json();
                setChatPreviews(data.chatPreviews || []);
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            }
        };

        fetchData();
    }, [url, isSpecialist]);
    
    const handleChatPreviewClick = (chatId) => {
        const params = new URLSearchParams({
            chatId,
        });
    
        fetch(`${url}/chat/info?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Ошибка при получении информации по соглашению: ${response.status}`);
                }
                return response.json();
            })
            .then((response) => {
                // console.log('агримант', agreementId);
                navigate(`/chat/${chatId}`, { state: { agreementId: response.agreementId } });
            })
            .catch((error) => {
                console.error(`Ошибка при получении информации по соглашению: ${error.message}`);
            });
    };
        
    return (
        <div>
            <TopBar></TopBar>
            <h2>Все ваши чаты:</h2>
            {chatPreviews.length > 0 ? (
                chatPreviews.map((item) => 
                    (<Chat title = {item.title} lastMessage={item.lastMessage} lastMessageTime={item.lastMessageTime} onClick = {() => handleChatPreviewClick(item.chatId)} key={item.id}></Chat>)
                    )) : (
                    <p>У вас пока что нет чатов </p>
                )}
            
        </div>
    );
};

export default AllChatsPage;
