import React, { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const Chat = ({ chatId }) => {
    const [newMessage, setNewMessage] = useState('');
    const [attachment, setAttachment] = useState(null);
    const url = localStorage.getItem('url');
    const getAuthToken = () => localStorage.getItem('authToken');
    const [userId, setUserId] = useState('');
    const [messages, setMessages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null); // Выбранное изображение для просмотра

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                const params = new URLSearchParams({ chatId });
                const response = await fetch(`${url}/chat/history?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${getAuthToken()}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка при загрузке истории чата: ${response.status}`);
                }

                const data = await response.json();
                setUserId(data.userId);

                if (data?.allMessages) {
                    const messagesWithImages = await loadAttachmentsForMessages(data.allMessages);
                    setMessages(messagesWithImages);
                }
            } catch (error) {
                console.error('Ошибка при загрузке истории чата:', error);
            }
        };

        fetchChatHistory();
    }, [chatId, url]);

    useEffect(() => {
        const socket = new SockJS(`${url}/ws/chat?token=${getAuthToken()}`);
        const stompClient = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log('WebSocket connected');
                stompClient.subscribe(`/topic/chat/${chatId}`, async (message) => {
                    const messageData = JSON.parse(message.body);
                    const messageWithImages = await loadAttachmentsForMessages([messageData]);
                    setMessages((prevMessages) => [...prevMessages, ...messageWithImages]);
                });
            },
            onStompError: (frame) => {
                console.error('STOMP error', frame);
            },
        });

        stompClient.activate();
        return () => {
            stompClient.deactivate();
        };
    }, [chatId]);

    const loadAttachmentsForMessages = async (messages) => {
        const updatedMessages = await Promise.all(
            messages.map(async (msg) => {
                if (msg.attachments && msg.attachments.length > 0) {
                    const images = await Promise.all(
                        msg.attachments.map(async (attachment) => {
                            try {
                                const params = new URLSearchParams({ imagePath: attachment });
                                const response = await fetch(`${url}/event/image?${params.toString()}`, {
                                    method: 'GET',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${getAuthToken()}`,
                                    },
                                });

                                if (!response.ok) {
                                    throw new Error(`Ошибка загрузки изображения: ${response.status}`);
                                }

                                const blob = await response.blob();
                                return URL.createObjectURL(blob);
                            } catch (error) {
                                console.error('Ошибка загрузки изображения:', error);
                                return null;
                            }
                        })
                    );
                    return { ...msg, images };
                }
                return msg;
            })
        );
        return updatedMessages;
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() && !attachment) return;

        const formData = new FormData();
        formData.append('chatId', chatId);
        if (newMessage.trim()) {
            formData.append('message', newMessage.trim());
        }
        if (attachment) {
            formData.append('files', attachment);
        }

        try {
            const response = await fetch(`${url}/event/new-message`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Ошибка при отправке сообщения: ${response.status}`);
            }

            setNewMessage('');
            setAttachment(null);
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
        }
    };

    return (
        <div style={styles.chatContainer}>
            <div style={styles.messagesContainer}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        style={
                            msg.initiatorId === userId ? styles.messageOutgoing : styles.messageIncoming
                        }
                    >
                        <div style={styles.messageBubble}>
                            {msg.message}
                            {msg.images && msg.images.length > 0 && (
                                <div style={styles.imageContainer}>
                                    {msg.images.map((img, i) =>
                                        img ? (
                                            <img
                                                key={i}
                                                src={img}
                                                alt="attachment"
                                                style={styles.image}
                                                onClick={() => setSelectedImage(img)} // Устанавливаем выбранное изображение
                                            />
                                        ) : (
                                            <p key={i} style={styles.loadingText}>
                                                Загрузка фото...
                                            </p>
                                        )
                                    )}
                                </div>
                            )}
                            <div style={styles.timestamp}>
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedImage && (
                <div style={styles.modal}>
                    <div style={styles.modalContent}>
                        <span style={styles.closeButton} onClick={() => setSelectedImage(null)}>
                            &times;
                        </span>
                        <img src={selectedImage} alt="Full size" style={styles.fullImage} />
                    </div>
                </div>
            )}

            <div style={styles.inputContainer}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Введите сообщение..."
                    style={styles.input}
                />
                <label htmlFor="fileInput" style={styles.attachLabel}>
                    📎
                </label>
                <input
                    type="file"
                    id="fileInput"
                    onChange={(e) => setAttachment(e.target.files[0])}
                    style={styles.fileInput}
                />
                {attachment && <span style={styles.attachmentName}>{attachment.name}</span>}
                <button onClick={handleSendMessage} style={styles.button}>
                    Отправить
                </button>
            </div>
        </div>
    );
};

const styles = {
    chatContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#ffffff',
    },
    messagesContainer: {
        flex: 1,
        overflowY: 'auto',
        padding: '10px',
    },
    messageOutgoing: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '10px',
    },
    messageIncoming: {
        display: 'flex',
        justifyContent: 'flex-start',
        marginBottom: '10px',
    },
    messageBubble: {
        maxWidth: '60%',
        padding: '10px',
        borderRadius: '8px',
        backgroundColor: '#007bff',
        color: 'black',
        wordWrap: 'break-word',
    },
    imageContainer: {
        marginTop: '5px',
    },
    image: {
        maxWidth: '100px',
        maxHeight: '100px',
        margin: '5px',
        cursor: 'pointer',
    },
    loadingText: {
        fontSize: '12px',
        color: '#888',
    },
    timestamp: {
        marginTop: '5px',
        fontSize: '12px',
        color: 'black',
        textAlign: 'right',
    },
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        position: 'relative',
        maxWidth: '80%',
        maxHeight: '80%',
    },
    fullImage: {
        width: '100%',
        height: 'auto',
        borderRadius: '8px',
    },
    closeButton: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        fontSize: '24px',
        color: '#fff',
        cursor: 'pointer',
    },
    inputContainer: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px',
        borderTop: '1px solid #ddd',
        backgroundColor: '#f4f4f4',
    },
    input: {
        flex: 1,
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ddd',
        outline: 'none',
    },
    fileInput: {
        display: 'none',
    },
    attachLabel: {
        fontSize: '20px',
        cursor: 'pointer',
        marginRight: '10px',
    },
    attachmentName: {
        fontSize: '12px',
        marginRight: '10px',
        color: '#007bff',
    },
    button: {
        padding: '10px 20px',
        marginLeft: '10px',
        background: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

export default Chat;
