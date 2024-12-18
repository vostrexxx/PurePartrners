import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Chat from './Chat';
import ChatContext from './ChatContext';
import RejectButton from './RejectButton';
import Builder from './Builder';

const ChatPage = () => {
    const { chatId } = useParams();
    const location = useLocation();
    const agreementId = location.state?.agreementId;

    console.log(agreementId);

    return (
        <div style={styles.container}>
            {/* Левая часть: контекст */}
            <div style={styles.leftPanel}>
                <ChatContext agreementId={agreementId} />
                <RejectButton agreementId={agreementId} />
            </div>

            {/* Средняя часть: чат */}
            <div style={styles.middlePanel}>
                <Chat chatId={chatId} />
            </div>

            {/* Правая часть: билдер */}
            <div style={styles.rightPanel}>
                <Builder agreementId={agreementId} />
                {/* <h3>Билдер</h3>
                <p>Здесь будут настройки или другие элементы</p> */}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        height: '100vh', // Полная высота экрана
        width: '100vw',  // Полная ширина экрана
    },
    leftPanel: {
        flex: '0 0 25%', // Фиксированная ширина 30%
        backgroundColor: 'black',
        color: 'white',
        borderRight: '1px solid #ddd',
        padding: '20px',
        overflowY: 'auto',
    },
    middlePanel: {
        flex: '0 0 30%', // Фиксированная ширина 30%
        backgroundColor: '#f4f4f4',
        padding: '20px',
        borderRight: '1px solid #ddd',
        overflowY: 'auto',
    },
    rightPanel: {
        flex: '0 0 35%', // Фиксированная ширина 40%
        backgroundColor: 'black',
        padding: '20px',
        overflowY: 'auto',
    },
};

export default ChatPage;
