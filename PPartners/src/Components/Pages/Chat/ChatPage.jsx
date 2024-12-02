import React from 'react';
import { useParams } from 'react-router-dom';
import Chat from './Chat';

const ChatPage = () => {
    const { chatId } = useParams();
    return (
        <div style={styles.container}>
            {/* Левая часть */}
            <div style={styles.leftPanel}>
                <h3>Левая панель</h3>

                
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
        height: '100vh', // Высота на весь экран
        width: '100%', // Ширина на весь экран
    },
    leftPanel: {
        flex: 1, // Занимает 1 часть от доступного пространства
        backgroundColor: 'black',
        color: 'white',
        borderRight: '1px solid #ddd',
        padding: '20px',
        overflowY: 'auto',
    },
    rightPanel: {
        flex: 3, // Занимает оставшееся пространство
        display: 'flex',
        flexDirection: 'column', // Элементы вертикально
        height: '100%', // Высота равна высоте экрана
        backgroundColor: '#f4f4f4',
        overflow: 'hidden',
    },
};

export default ChatPage;
