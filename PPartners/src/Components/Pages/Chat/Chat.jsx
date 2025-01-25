import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { FaFileWord, FaFileExcel, FaFilePdf, FaFileAlt } from 'react-icons/fa';

const Chat = ({ chatId }) => {
    const [newMessage, setNewMessage] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const url = localStorage.getItem('url');
    const getAuthToken = () => localStorage.getItem('authToken');
    const [userId, setUserId] = useState('');
    const [messages, setMessages] = useState([]);

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
                    const images = [];
                    const documents = [];
                    const videos = [];

                    msg.attachments.forEach((attachment) => {
                        const extension = attachment.originalFileName.split('.').pop().toLowerCase();
                        if (['png', 'jpg', 'jpeg', 'gif'].includes(extension)) {
                            images.push(attachment);
                        } else if (['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(extension)) {
                            documents.push(attachment);
                        } else if (['mp4', 'avi', 'mov', 'mkv'].includes(extension)) {
                            videos.push(attachment);
                        }
                    });

                    const loadedImages = await Promise.all(
                        images.map(async (attachment) => {
                            try {
                                const params = new URLSearchParams({ filePath: attachment.filePath });
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

                    return { ...msg, images: loadedImages, documents, videos };
                }
                return msg;
            })
        );
        return updatedMessages;
    };


    const handleDownloadFile = async (filePath, fileName) => {
        try {
            const params = new URLSearchParams({ filePath });
            const response = await fetch(`${url}/event/document?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка загрузки файла: ${response.status}`);
            }

            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Ошибка скачивания файла:', error);
        }
    };


    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        switch (extension) {
            case 'doc':
            case 'docx':
                return <FaFileWord style={{ color: '#007bff', fontSize: '20px' }} />; // Word
            case 'xls':
            case 'xlsx':
                return <FaFileExcel style={{ color: '#28a745', fontSize: '20px' }} />; // Excel
            case 'pdf':
                return <FaFilePdf style={{ color: '#dc3545', fontSize: '20px' }} />; // PDF
            default:
                return <FaFileAlt style={{ color: '#6c757d', fontSize: '20px' }} />; // Другие файлы
        }
    };


    const handleSendMessage = async () => {
        if (!newMessage.trim() && attachments.length === 0) return;

        const formData = new FormData();
        formData.append('chatId', chatId);
        if (newMessage.trim()) {
            formData.append('message', newMessage.trim());
        }
        attachments.forEach((file) => {
            formData.append('files', file);
        });

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
            setAttachments([]);
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
        }
    };

    const handleImageClick = (image) => {
        setSelectedImage(image);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff' }}>
            {selectedImage && (
                <div
                    onClick={() => setSelectedImage(null)}
                    style={{
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
                    }}
                >
                    <img
                        src={selectedImage}
                        alt="full-size"
                        style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '10px' }}
                    />
                </div>
            )}

            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            justifyContent: msg.initiatorId === userId ? 'flex-end' : 'flex-start',
                            marginBottom: '10px',
                        }}
                    >
                        <div
                            style={{
                                maxWidth: '60%',
                                padding: '10px',
                                borderRadius: '8px',
                                backgroundColor: msg.initiatorId === userId ? '#FFB640' : '#4282D3',
                                color: msg.initiatorId === userId ? 'black' : '#000000',
                                wordWrap: 'break-word',
                            }}
                        >
                            {msg.message}
                            <div style={{ marginTop: '5px' }}>
                                {/* Отображение изображений */}
                                {msg.images &&
                                    msg.images.map((img, i) =>
                                        img ? (
                                            <img
                                                key={i}
                                                src={img}
                                                alt="attachment"
                                                style={{
                                                    maxWidth: '100px',
                                                    maxHeight: '100px',
                                                    margin: '5px',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => handleImageClick(img)}
                                            />
                                        ) : (
                                            <p key={i} style={{ fontSize: '12px', color: '#888' }}>
                                                Загрузка изображения...
                                            </p>
                                        )
                                    )}

                                {/* Отображение документов */}
                                {msg.documents &&
                                    msg.documents.map((doc, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginTop: '5px',
                                                cursor: 'pointer',
                                            }}
                                            onClick={() =>
                                                handleDownloadFile(doc.filePath, doc.originalFileName)
                                            }
                                        >
                                            <span style={{ marginRight: '5px' }}>
                                                {getFileIcon(doc.originalFileName)}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: '14px',
                                                    color: 'black',
                                                }}
                                            >
                                                {doc.originalFileName}
                                            </span>
                                        </div>
                                    ))}
                                {msg.videos &&
                                    msg.videos.map((video, i) => (
                                        <div
                                            key={i}
                                            style={{ marginTop: '5px', cursor: 'pointer', color: 'blue' }}
                                            onClick={() => handleDownloadFile(video.filePath, video.originalFileName)}
                                        >
                                            {video.originalFileName}
                                        </div>
                                    ))}
                            </div>
                            <div
                                style={{
                                    marginTop: '5px',
                                    fontSize: '12px',
                                    color: 'black',
                                    textAlign: 'right',
                                }}
                            >
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px',
                    borderTop: '1px solid #ddd',
                }}
            >
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Введите сообщение..."
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        outline: 'none',
                    }}
                />
                <label
                    htmlFor="fileInput"
                    style={{
                        fontSize: '20px',
                        cursor: 'pointer',
                        marginRight: '10px',
                    }}
                >
                    📎
                </label>
                <input
                    type="file"
                    id="fileInput"
                    multiple
                    onChange={(e) => {
                        const files = Array.from(e.target.files);
                        const validFormats = ['png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'mp4', 'avi', 'mov', 'mkv'];

                        const validFiles = files.filter((file) => {
                            const extension = file.name.split('.').pop().toLowerCase();
                            if (!validFormats.includes(extension)) {
                                alert(`Некорректный формат файла: ${file.name}`);
                                return false;
                            }
                            return true;
                        });

                        setAttachments(validFiles);
                    }}
                    style={{ display: 'none' }}
                />

                {attachments.map((file, index) => (
                    <span
                        key={index}
                        style={{
                            fontSize: '12px',
                            marginRight: '5px',
                            color: '#007bff',
                        }}
                    >
                        {file.name}
                    </span>
                ))}
                <button
                    onClick={handleSendMessage}
                    style={{
                        padding: '10px 20px',
                        marginLeft: '10px',
                        background: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Отправить
                </button>
            </div>
        </div>
    );
};
export default Chat;
