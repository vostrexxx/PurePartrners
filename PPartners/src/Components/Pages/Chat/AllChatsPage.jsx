import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Chat from '../../Previews/Chat';
import TopBar from '../../TopBars/TopBar'
import { useProfile } from '../../Context/ProfileContext';
import { Container, Row, Col, Nav, Tab } from "react-bootstrap";

const AllChatsPage = () => {
    const [chatPreviews, setChatPreviews] = useState([]);
    const getAuthToken = () => localStorage.getItem('authToken');
    let url = localStorage.getItem('url');
    const { isSpecialist } = useProfile();
    const navigate = useNavigate();

    useEffect(() => {
        console.log("Данные из localStorage:");
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i); // Получаем ключ по индексу
            const value = localStorage.getItem(key); // Получаем значение по ключу
            console.log(`${key}: ${value}`);
        }
    })


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
                console.log(response.agreementId)
                navigate(`/chat/${chatId}`, { state: { agreementId: response.agreementId } });
                localStorage.setItem('agreementId', response.agreementId);
            })
            .catch((error) => {
                console.error(`Ошибка при получении информации по соглашению: ${error.message}`);
            });
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <TopBar />
            <Container
                fluid
                style={{
                    // backgroundColor: "#242582",
                    flex: 1,
                    padding: "20px",
                }}
                className="BG"

            >
                <Row className="justify-content-center">
                    <Col xs={12} md={10} lg={8}>
                        <h2 className="text-center mb-4 text-white">Все ваши чаты</h2>
                    </Col>

                    {chatPreviews.length > 0 ? (
                        chatPreviews.map((item) =>
                            (<Chat title={item.title} lastMessage={item.lastMessage} lastMessageTime={item.lastMessageTime} onClick={() => handleChatPreviewClick(item.chatId)} key={item.id}></Chat>)
                        )) : (
                        <p className='text-white text-center'>У вас пока что нет чатов </p>
                    )}
                </Row>

            </Container>
        </div>
    );
};

export default AllChatsPage;
