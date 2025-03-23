import { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { FaFileWord, FaFileExcel, FaFilePdf, FaFileAlt } from 'react-icons/fa';
import { Container, Form, InputGroup, Button, Image, Row, Col } from 'react-bootstrap';
// import { FaPaperclip } from "react-icons/fa";
import { MdAttachFile } from "react-icons/md";
import { MdSend } from "react-icons/md";
import { FaPaperPlane } from "react-icons/fa";
const Chat = ({ chatId }) => {
    const [newMessage, setNewMessage] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const url = localStorage.getItem('url');
    const getAuthToken = () => localStorage.getItem('authToken');
    const [userId, setUserId] = useState('');
    const [messages, setMessages] = useState([]);
    const chatRef = useRef(null); // Создаём ссылку на контейнер чата

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        setTimeout(() => {
            if (chatRef.current) {
                chatRef.current.scrollTop = chatRef.current.scrollHeight;
            }
        }, 100);
    }, [messages]);

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
        <Container
            fluid
            className="d-flex flex-column p-2 bg-white"
            style={{
                height: '80vh', // Фиксированная высота (80% высоты экрана)
                border: '1px solid #ccc',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                width: '100%', // Ширина 100%
            }}
        >
            {/* Просмотр изображения в полноэкранном режиме */}
            {selectedImage && (
                <div
                    onClick={() => setSelectedImage(null)}
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-75"
                    style={{ zIndex: 1000 }}
                >
                    <Image src={selectedImage} alt="full-size" fluid rounded />
                </div>
            )}

            {/* Сообщения */}
            <div ref={chatRef} className="flex-grow-1 overflow-auto p-2">
                {messages.map((msg, index) => (
                    <div key={index} className={`d-flex mb-3 ${msg.initiatorId === userId ? 'justify-content-end' : 'justify-content-start'}`}>
                        <div
                            className={`p-2 rounded ${msg.initiatorId === userId ? 'bg-warning' : 'bg-primary text-black'}`}
                            style={{ maxWidth: '75%', wordWrap: 'break-word' }}
                        >
                            <div>{msg.message}</div>
                            {/* Медиафайлы */}
                            {msg.images?.map((img, i) => (
                                <Image
                                    key={i}
                                    src={img}
                                    alt="attachment"
                                    thumbnail
                                    className="mt-2"
                                    style={{ maxWidth: '100px', cursor: 'pointer' }}
                                    onClick={() => handleImageClick(img)}
                                />
                            ))}
                            {msg.documents?.map((doc, i) => (
                                <div key={i} className="mt-2 text-primary" onClick={() => handleDownloadFile(doc.filePath, doc.originalFileName)}>
                                    📄 {doc.originalFileName}
                                </div>
                            ))}
                            {msg.videos?.map((video, i) => (
                                <div key={i} className="mt-2 text-success" onClick={() => handleDownloadFile(video.filePath, video.originalFileName)}>
                                    🎥 {video.originalFileName}
                                </div>
                            ))}
                            <div className="text-end text-muted" style={{ fontSize: '0.75rem' }}>
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Form className="border-top p-3 bg-light">
                <Row className="g-2">
                    <Col>
                        <InputGroup className="align-items-center">
                            <Form.Control
                                as="textarea"
                                rows={1}
                                placeholder="Введите сообщение..."
                                value={newMessage}
                                onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    e.target.style.height = "auto";
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                style={{
                                    resize: "none",
                                    overflow: "hidden",
                                    borderRadius: "12px",
                                    padding: "0.75rem 1rem",
                                    fontSize: "1rem",
                                    lineHeight: "1.5",
                                    border: "1px solid white",
                                    backgroundColor: "white",
                                    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)",
                                }}
                            />
                            <input
                                type="file"
                                id="fileInput"
                                multiple
                                hidden
                                onChange={(e) => {
                                    const files = Array.from(e.target.files);
                                    const validFormats = ["png", "jpg", "jpeg", "gif", "pdf", "doc", "docx", "xls", "xlsx", "mp4", "avi", "mov", "mkv"];
                                    const validFiles = files.filter(file => validFormats.includes(file.name.split(".").pop().toLowerCase()));
                                    setAttachments(validFiles);
                                }}
                            />
                            <label htmlFor="fileInput" className="input-group-text border-0 p-2" style={{ cursor: "pointer" }}>
                                <MdAttachFile style={{ fontSize: "1.5rem", color: "#6c757d" }} />
                            </label>
                            <Button
                                variant="primary"
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim() && attachments.length === 0}
                                style={{
                                    borderRadius: "12px",
                                    padding: "0.5rem 1.2rem",
                                    fontSize: "1rem",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <MdSend />
                            </Button>
                        </InputGroup>
                    </Col>
                </Row>
                {attachments.length > 0 && (
                    <div className="mt-3 p-2 bg-white border rounded">
                        {attachments.map((file, index) => (
                            <small key={index} className="d-block text-primary" style={{ fontSize: "0.85rem" }}>
                                📎 {file.name}
                            </small>
                        ))}
                    </div>
                )}
            </Form>

            {/* Стили */}
            <style>
                {`
    @media (max-width: 768px) {
        .p-2 {
            padding: 0.5rem !important;
        }
        .flex-grow-1 {
            font-size: 0.9rem;
        }
        .bg-warning, .bg-primary {
            font-size: 0.9rem;
        }
        .btn {
            font-size: 0.9rem;
        }
        .input-group-text {
            font-size: 0.9rem;
        }
        .text-muted {
            font-size: 0.7rem;
        }
    }

    .bg-warning {
        background-color: #d6e0d4 !important;
        color: black;
    }

    .bg-primary {
        background-color: #a7bfd0 !important;
        color: white;
    }
    `}
            </style>
        </Container>
    );
};
export default Chat;
