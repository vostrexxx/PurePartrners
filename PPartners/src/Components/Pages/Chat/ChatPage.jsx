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
