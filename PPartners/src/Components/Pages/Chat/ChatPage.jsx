import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useSearchParams } from 'react-router-dom';
import { Container, Nav, Button, Tab } from 'react-bootstrap';
import Chat from './Chat';
import ChatContext from './ChatContext';
import Builder from './Builder';
import WorkStagesBuilder from './WorkStagesBuilder';
import TopBar from '../../TopBars/UnswitchTopBar';

const ChatPage = () => {
    const { chatId } = useParams();
    const location = useLocation();
    const agreementId = Number(location.state?.agreementId || localStorage.getItem('agreementId'));
    const authToken = localStorage.getItem("authToken");
    const url = localStorage.getItem("url");
    const [initiatorId, setInitiatorId] = useState(null);
    const [receiverId, setReceiverId] = useState(null);
    const [localizedStatus, setLocalizedStatus] = useState(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const defaultTab = searchParams.get("tab") || "chat";
    const [activeTab, setActiveTab] = useState(defaultTab);

    useEffect(() => {
        const fetchAgreement = async () => {
            try {
                const response = await fetch(`${url}/agreement?agreementId=${agreementId}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
                const data = await response.json();
                setInitiatorId(data.agreementInfo.initiatorId);
                setReceiverId(data.agreementInfo.receiverId);
                setLocalizedStatus(data.agreementInfo.localizedStatus);
            } catch (error) {
                console.error('Ошибка при загрузке соглашения:', error);
            }
        };
        fetchAgreement();
    }, [agreementId, authToken, url]);

    if (localizedStatus === 'Отклонено') {
        return (
            <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
                <TopBar />
                <Container
                    fluid
                    style={{
                        backgroundColor: "#242582",
                        flex: 1,
                        padding: "20px",
                        display: "flex",
                        justifyContent: "center", // Центрирование по горизонтали
                        alignItems: "center", // Центрирование по вертикали
                    }}
                >
                    <h5 className="text-white">Соглашение отклонено одним из пользователей</h5>
                </Container>
            </div>
        );


    }

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <TopBar />
            <Container fluid style={{ flex: 1, padding: "20px" }}
                className="BG"

            >
                <Nav variant="tabs" className="justify-content-center mb-3">
                    <Nav.Item>
                        <Nav.Link
                            className={`text-white ${activeTab === 'chat' ? 'active fw-bold' : ''}`}
                            onClick={() => handleTabChange('chat')}
                            style={{ padding: '8px 12px' }}

                        >
                            Чат
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            className={`text-white ${activeTab === 'context' ? 'active fw-bold' : ''}`}
                            onClick={() => handleTabChange('context')}
                            style={{ padding: '8px 12px' }}

                        >
                            Соглашение
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            className={`text-white ${activeTab === 'builder' ? 'active fw-bold' : ''}`}
                            onClick={() => handleTabChange('builder')}
                            style={{ padding: '8px 12px' }}
                        >
                            Смета
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link
                            className={`text-white ${activeTab === 'stages' ? 'active fw-bold' : ''}`}
                            onClick={() => handleTabChange('stages')}
                            style={{ padding: '8px 12px' }}
                        >
                            Этапы
                        </Nav.Link>
                    </Nav.Item>
                </Nav>

                <Tab.Content >
                    {activeTab === 'chat' && <Chat chatId={chatId} />}
                    {activeTab === 'context' && <ChatContext agreementId={agreementId} />}
                    {activeTab === 'builder' && (
                        <Builder
                            agreementId={agreementId}
                            receiverId={receiverId}
                            initiatorId={initiatorId}
                        />
                    )}
                    {activeTab === 'stages' && (
                        <WorkStagesBuilder
                            agreementId={agreementId}
                            receiverId={receiverId}
                            initiatorId={initiatorId}
                        />
                    )}
                </Tab.Content>

                <style>
                    {`
                    .nav-tabs .nav-link.active {
                        background-color: #ff7101 !important;
                        color: white !important;
                        font-weight: bold;
                    }

                    .nav-tabs .nav-link {
                        transition: background-color 0.3s, color 0.3s;
                        color: white;
                    }

                    .nav-tabs .nav-link:hover {
                        background-color: #3e4a89;
                    }
                    `}
                </style>
            </Container>
        </div>
    );
};

export default ChatPage;
