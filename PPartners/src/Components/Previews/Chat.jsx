import React from 'react';

const Chat = ({ title, lastMessage, key, onClick, lastMessageTime}) => {
    return (
        <div style={styles.card} onClick={onClick}>
            <h3>{title}</h3>
            <p>Последнее сообщение: <b>{lastMessage}</b> <p style={styles.lastMessageTime} >{lastMessageTime}</p></p>
        </div>
    );
};

const styles = {
    card: {
        color:'black', 
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        margin: '16px 0',
        cursor: 'pointer',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    lastMessageTime:{
        fontSize: '6'
    }
};

export default Chat;
