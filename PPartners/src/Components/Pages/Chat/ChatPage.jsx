import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Chat from './Chat';
import ChatContext from './ChatContext';
import Card from '../../Previews/Card';
import RejectButton from './RejectButton';


const ChatPage = () => {
    const { chatId } = useParams(); 
    const location = useLocation(); 
    const agreementId = location.state?.agreementId; 

    console.log(agreementId);

    return (
        <div style={styles.container}>
            {/* Левая часть */}
            <div style={styles.leftPanel}>
                <ChatContext agreementId={agreementId} />
                <RejectButton agreementId={agreementId} />
            </div>

            {/* Правая часть с чатом */}
            <div style={styles.rightPanel}>
                <Chat chatId={chatId} />
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        height: '100vh',
        width: '100%',
    },
    leftPanel: {
        flex: 1,
        backgroundColor: 'black',
        color: 'white',
        borderRight: '1px solid #ddd',
        padding: '20px',
        overflowY: 'auto',
    },
    rightPanel: {
        flex: 3,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#f4f4f4',
        overflow: 'hidden',
    },
};

export default ChatPage;
