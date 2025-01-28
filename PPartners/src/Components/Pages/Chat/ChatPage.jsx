import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Chat from './Chat';
import ChatContext from './ChatContext';
import RejectButton from './RejectButton';
import Builder from './Builder';
import ContractButton from './CreateContractButton';
import DocumentManager from './DocumentManager';
import WorkStagesBuilder from './WorkStagesBuilder';
const ChatPage = () => {
    const { chatId } = useParams();
    const location = useLocation();
    const agreementId = location.state?.agreementId;
    const authToken = localStorage.getItem("authToken");
    const url = localStorage.getItem("url");

    const [initiatorId, setInitiatorId] = useState(null);
    const [receiverId, setReceiverId] = useState(null);

    useEffect(() => {
        const fetchAgreement = async () => {
            const params = new URLSearchParams({ agreementId });
            fetch(`${url}/agreement?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Ошибка при получении информации по соглашению: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log('Инфа по соглашению', data)
                    setInitiatorId(data.agreementInfo.initiatorId)
                    setReceiverId(data.agreementInfo.receiverId)
                })
                .catch((error) => {
                    console.error(`Ошибка при получении информации по соглашению: ${error.message}`);
                });
        }

        fetchAgreement();
    }, [agreementId, authToken, url]);

    // useEffect(() => {
    //     console.log(receiverId, initiatorId)
    // },[receiverId, initiatorId])

    // console.log(agreementId);

    return (
        <div style={styles.container}>
            {/* <Topbar/> */}
            {/* Левая часть: контекст */}
            <div style={styles.leftPanel}>
                <ChatContext agreementId={agreementId} />
                <RejectButton agreementId={agreementId} />
                {/* <ContractButton agreementId={agreementId} /> */}

            </div>

            {/* Средняя часть: чат */}
            <div style={styles.middlePanel}>
                <Chat chatId={chatId} />
            </div>

            {/* Правая часть: билдер */}
            <div style={styles.rightPanel}>
                <Builder agreementId={agreementId}
                    receiverId={receiverId}
                    initiatorId={initiatorId} />

                <WorkStagesBuilder agreementId={agreementId}
                    receiverId={receiverId}
                    initiatorId={initiatorId} />
                {/* <DocumentManager agreementId={agreementId} /> */}

            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        height: '100vh', // Высота 100% от экрана
        width: '100%',   // Ширина 100% от экрана
        flexWrap: 'nowrap', // Предотвращение переноса
        // marginTop: '30px'
    },
    leftPanel: {
        flex: '1 1 25%', // Панель будет занимать 25% ширины, но может адаптироваться
        maxWidth: '25%', // Максимальная ширина для ограничений
        minWidth: '200px', // Минимальная ширина панели
        backgroundColor: 'black',
        color: 'white',
        borderRight: '1px solid #ddd',
        padding: '20px',
        overflowY: 'auto',
    },
    middlePanel: {
        flex: '1 1 50%', // Панель будет занимать 50% ширины
        maxWidth: '50%',
        minWidth: '300px', // Минимальная ширина панели
        backgroundColor: '#f4f4f4',
        padding: '20px',
        borderRight: '1px solid #ddd',
        overflowY: 'auto',
    },
    rightPanel: {
        flex: '1 1 25%', // Панель будет занимать 25% ширины
        maxWidth: '25%',
        minWidth: '200px', // Минимальная ширина панели
        backgroundColor: 'black',
        padding: '20px',
        overflowY: 'auto',
    },
};



export default ChatPage;
