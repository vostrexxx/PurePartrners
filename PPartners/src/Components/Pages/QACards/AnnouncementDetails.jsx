import {useEffect, useState} from 'react';
import {useParams, useLocation, useNavigate} from 'react-router-dom';
import ReactionWindow from '../Agreement/Reaction';
import {useProfile} from '../../Context/ProfileContext';
import TopBar from '../../TopBars/TopBar';
import EntityCard from '../../Previews/EntityCard'
import {useToast} from '../../Notification/ToastContext'
import {Button, Card, Container, Form, Row, Col, Image, Modal, ButtonGroup} from "react-bootstrap";
import TextField from "@mui/material/TextField";
import {FaArrowLeft} from 'react-icons/fa';

import {Delete} from '@mui/icons-material';

const AnnouncementDetails = () => {
    const showToast = useToast();

    const {id} = useParams();
    const [announcement, setAnnouncement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditable, setIsEditable] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [entityId, setEntityId] = useState(null);
    const [isLegalEntity, setIsLegalEntity] = useState(null);
    const [entityData, setEntityData] = useState(null);
    const [selectedEntityId, setSelectedEntityId] = useState(null)

    const url = localStorage.getItem('url');
    const navigate = useNavigate();
    const getAuthToken = () => {
        return localStorage.getItem('authToken');
    };

    const location = useLocation();
    const canEditOrDelete = location.state?.fromLk || false; // Показывать кнопки только если fromLk === true

    const [trigger, setTrigger] = useState(false);

    const [images, setImages] = useState([]);
    const [newImages, setNewImages] = useState([]); // Для хранения новых фотографий

    const [selectedImage, setSelectedImage] = useState(null);

    const [files, setFiles] = useState([]); // Список файлов
    const [newFiles, setNewFiles] = useState([]); // Новые загружаемые файлы


    useEffect(() => {
        const fetchData = async () => {
            try {
                // Шаг 1: Получение данных объявления
                const params = new URLSearchParams({announcementId: id});
                const response = await fetch(`${url}/announcement?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка при получении объявления: ${response.status}`);
                }

                const data = await response.json();

                if (data.success === 1 && data.announcementInfo) {
                    setAnnouncement(data.announcementInfo);
                    console.log('Объявление', data.announcementInfo)

                    // Шаг 2: Получение данных лица
                    const entityId = data.announcementInfo.entityId; // Получаем ID лица из объявления
                    setEntityId(entityId);
                    if (entityId) {
                        const fetchEntity = async (id) => {
                            const entityParams = new URLSearchParams({customerId: id});
                            const entityResponse = await fetch(`${url}/customer?${entityParams.toString()}`, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${getAuthToken()}`,
                                },
                            });

                            if (!entityResponse.ok) {
                                throw new Error(`Ошибка при получении данных лица: ${entityResponse.status}`);
                            }

                            const entityData = await entityResponse.json();
                            setIsLegalEntity(entityData.isLegalEntity)
                            setEntityData(entityData)
                            // console.log('Данные лица:', entityData); // Логируем данные лица
                        };

                        await fetchEntity(entityId); // Выполняем запрос для получения данных лица
                    } else {
                        // console.error('ID лица отсутствует в данных объявления');
                        // showToast("Не выбрано лицо в данных объявления", "error")

                    }
                } else {
                    setError('Информация об объявлении не найдена');
                }
            } catch (error) {
                setError(`Ошибка при выполнении запросов: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, url, trigger]);

    useEffect(() => {
        const fetchImages = async () => {
            if (announcement?.announcementImages) {
                const loadedImages = await Promise.all(
                    announcement.announcementImages.map(async (imagePath) => {
                        const params = new URLSearchParams({imagePath});
                        const response = await fetch(`${url}/announcement/image?${params.toString()}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${getAuthToken()}`,
                            },
                        });

                        if (!response.ok) {
                            // console.error(`Ошибка загрузки изображения: ${imagePath}`);
                            showToast("Ошибка загрузки изображения", "danger")

                            return null;
                        }

                        const blob = await response.blob();
                        return URL.createObjectURL(blob); // Создаем объект URL для изображения
                    })
                );

                setImages(loadedImages.filter((img) => img !== null)); // Исключаем неудачные загрузки
            }
        };

        if (announcement) {
            fetchImages();
        }
    }, [announcement, url]);

    useEffect(() => {
        if (announcement?.announcementFiles) {
            setFiles(announcement.announcementFiles); // Устанавливаем файлы из данных объявления
        }
    }, [announcement]);


    const handleImageClick = (image) => {
        setSelectedImage(image); // Устанавливаем выбранное изображение
    };

    const handleAddFiles = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setNewFiles((prev) => [...prev, ...selectedFiles]); // Добавляем новые файлы
    };

    const handleRemoveNewFile = (index) => {
        setNewFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const handleDownloadFile = async (storedFileName, originalFileName) => {
        try {
            const params = new URLSearchParams({filePath: storedFileName});
            const response = await fetch(`${url}/announcement/document?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
            });

            if (!response.ok) {
                showToast("Ошибка скачивания файла", "danger")
                throw new Error(`Ошибка скачивания файла: ${response.status}`);

            }
            // showToast("Ошибка создания объявления", "error")

            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = originalFileName;
            link.click();
        } catch (error) {
            // console.error('Ошибка скачивания файла:', error);
            // alert('Не удалось скачать файл.');
            showToast("Не удалось скачать файл", "danger")
        }
    };

    const handleDeleteFile = async (storedFileName) => {


        try {
            const params = new URLSearchParams({filePath: storedFileName});
            const response = await fetch(`${url}/announcement/file?${params.toString()}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка удаления файла: ${response.status}`);
            }

            showToast("Файл успешно удален", "success")

            setFiles((prevFiles) => prevFiles.filter((file) => file.storedFileName !== storedFileName));
        } catch (error) {
            showToast("Не удалось удалить файл", "danger")

        }

    };

    const handleUploadFiles = async () => {
        if (newFiles.length === 0) {
            // alert('Вы не выбрали файлы для загрузки.');
            showToast("Вы не выбрали файлы для загрузки", "danger")
            return;
        }

        try {
            const formData = new FormData();
            newFiles.forEach((file) => formData.append('files', file));
            formData.append('announcementId', id); // Добавляем ID объявления
            formData.append('type', 'file');

            const response = await fetch(`${url}/announcement/files`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Ошибка загрузки файлов: ${response.status}`);
            }

            // alert('Файлы успешно загружены.');
            showToast("Файлы успешно загружены", "success")

            setNewFiles([]); // Очищаем локальное состояние
            setTrigger(!trigger); // Обновляем данные
        } catch (error) {
            // console.error('Ошибка загрузки файлов:', error);
            // alert('Не удалось загрузить файлы.');
            showToast("Не удалось загрузить файлы", "danger")

        }
    };


    const handleCloseImageModal = () => {
        setSelectedImage(null); // Закрываем модальное окно
    };

    const handleAddImages = (e) => {
        const files = Array.from(e.target.files);
        setNewImages((prev) => [...prev, ...files]); // Добавляем новые файлы к уже выбранным
    };


    const handleEditClick = () => {
        setIsEditable(true);
    };

    const handleOpenReaction = () => {
        // тут открываем модульное окно

        setIsModalOpen(true); // Открыть модальное окно
    };

    const closeModal = () => {
        // тут открываем модульное окно
        setIsModalOpen(false); // Открыть модальное окно
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setAnnouncement((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCancelUpload = () => {
        setNewImages([]); // Очищаем список новых фотографий
    };


    const handleUploadImages = async () => {
        if (newImages.length === 0) {
            // alert('Вы не выбрали фотографии для загрузки.');
            showToast("Ошибка создания объявления", "danger")
            return;
        }

        try {
            const formData = new FormData();
            newImages.forEach((file) => formData.append('files', file)); // Добавляем все выбранные файлы
            formData.append('announcementId', id); // Добавляем ID объявления
            formData.append('type', 'image');
            const response = await fetch(`${url}/announcement/files`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`, // Заголовок авторизации
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Ошибка при загрузке фотографий: ${response.status}`);
            }

            // alert('Фотографии успешно загружены.');
            showToast("Фотография успешно загружена", "success")

            setNewImages([]); // Очищаем локальное состояние после успешной отправки
            setTrigger(!trigger); // Обновляем данные объявления
        } catch (error) {
            // console.error('Ошибка при загрузке фотографий:', error);
            // alert('Не удалось загрузить фотографии.');
            showToast("Не удалось загрузить фотографии", "danger")
        }
    };


    const handleDeleteImage = async (filePath) => {

        try {
            const params = new URLSearchParams({filePath});
            const response = await fetch(`${url}/announcement/file?${params.toString()}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка при удалении изображения: ${response.status}`);
            }

            // alert('Изображение успешно удалено.');
            showToast("Изображение успешно удалено", "success")


            // Удаляем изображение из локального состояния после успешного удаления
            setImages((prevImages) => prevImages.filter((img) => img !== filePath));
            setAnnouncement((prev) => ({
                ...prev,
                announcementImages: prev.announcementImages.filter((img) => img !== filePath),
            }));
        } catch (error) {
            // console.error('Ошибка при удалении изображения:', error);
            // alert('Не удалось удалить изображение.');
            showToast("Не удалось удалить изображение", "danger")

        }
    };


    const handleSaveClick = async () => {
        try {
            const response = await fetch(`${url}/announcement/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify(announcement),
            });

            if (!response.ok) {
                throw new Error(`Ошибка при сохранении данных: ${response.status}`);
            }

            const data = await response.json();
            showToast("Объявление успешно сохранено", "success")

            if (data.success === 1) {
                setIsEditable(false);
            } else {
                setError('Не удалось сохранить данные');
            }
        } catch (error) {
            // setError(`Ошибка при сохранении: ${error.message}`);
            showToast("Ошибка при слхранении", "danger")

        }
    };

    const handleDeleteClick = async () => {

        try {
            const params = new URLSearchParams({
                announcementId: id,
            });

            const response = await fetch(`${url}/announcement?${params.toString()}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
            });


            if (!response.ok) {
                throw new Error(`Ошибка при удалении объявления: ${response.status}`);
            }

            const data = await response.json();
            if (data.success === 1) {
                showToast("Объявление успешно удалено", "success")
                navigate('/account-actions'); // Перенаправление после успешного удаления
            } else {
                setError('Не удалось удалить анкету');
            }
        } catch (error) {
            // setError(`Ошибка при удалении: ${error.message}`);
            showToast("Ошибка удаления", "danger")

        }

    };

    const handleEventEntity = async (mode) => {
        if (mode === "link") {//annId, mode, enityId
            try {
                const response = await fetch(`${url}/announcement/entity`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                    body: JSON.stringify({announcementId: id, mode: "link", entityId: selectedEntityId}),
                });

                if (!response.ok) {
                    throw new Error(`Ошибка применения изменения: ${response.status}`);
                }

                if (selectedEntityId) {
                    showToast("Лицо успешно привязано", "success")
                } else {
                    showToast("Выберите лицо, которое хотите привязать", "danger")
                }
            } catch (error) {
                // console.error('Ошибка применения изменения:', error);
                // alert('Не удалось одобрить изменение.');
                showToast("Не удалось привязать лицо", "danger")

            }
        } else if (mode === "unlink") {//
            try {
                const response = await fetch(`${url}/announcement/entity`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                    body: JSON.stringify({announcementId: id, mode: "unlink"}),
                });

                if (!response.ok) {
                    throw new Error(`Ошибка применения изменения: ${response.status}`);
                }

                // alert('Лицо успешно отвязано!');
                showToast("Лицо успешно отвязано", "success")

            } catch (error) {
                // console.error('Ошибка привязки лица:', error);
                showToast("Не удалось отвязать лицо", "danger")

                // alert('Не удалось одобрить изменение.');
            }
        }
        setTrigger(!trigger)
    }

    const handleGoBack = () => {
        window.history.back();
    };

    const handleSelectEntity = (id) => {
        setSelectedEntityId(id);
        // console.log(id)
    };

    if (loading) return <div>Загрузка данных анкеты...</div>;
    if (error) return <div>Ошибка: {error}</div>;


    return (
        <div style={{display: "flex", flexDirection: "column", height: "100vh"}}>
            <TopBar/>
            <Container
                fluid
                style={{
                    // backgroundColor: "#242582",
                    flex: 1,
                    padding: "20px",
                }}


                className="BG"

            >

                <Row className="justify-content-center">
                    <Col md={8} style={{padding: "20px"}}>
                        <Card
                            style={{
                                // backgroundColor: "#222",
                                // color: "white",
                                borderRadius: "12px",
                                padding: "20px",
                                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
                            }}
                        >
                            <Card.Text>
                                <Button
                                    onClick={handleGoBack}
                                    variant="secondary"
                                    style={styles.fixedButton}

                                >
                                    <FaArrowLeft/>
                                </Button>
                            </Card.Text>

                            <Card.Body>
                                <h2 className="text-center" style={{
                                    color: "#ff7f00", cafontWeight: "bold"
                                }}>
                                    Детали объявления
                                </h2>

                                <hr className=''
                                    style={{
                                        height: '2px',
                                        background: "white",
                                        // margin: margin,
                                    }}
                                />
                                <Form>
                                    {/* Категории работ */}
                                    <Form.Group className="mb-3">
                                        <Form.Label>Категории работ</Form.Label>
                                        <TextField
                                            type="text"
                                            name="workCategories"
                                            value={announcement.workCategories}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                            fullWidth
                                            className="form-control-placeholder"
                                            multiline
                                            minRows={1}
                                            maxRows={4}
                                            sx={{
                                                // Стили для обычного состояния
                                                '& .MuiInputBase-input': {
                                                    color: 'black', // Черный цвет текста
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'black', // Черный цвет рамки
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: 'black', // Черный цвет placeholder
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: 'black', // Черный цвет placeholder при фокусе
                                                },

                                                // Стили для disabled состояния
                                                '& .MuiInputBase-root.Mui-disabled': {
                                                    '& .MuiInputBase-input': {
                                                        color: 'black', // Черный цвет текста, даже если disabled
                                                        WebkitTextFillColor: 'black', // Для Safari и других браузеров на WebKit
                                                    },
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'black', // Черный цвет рамки
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        color: 'black', // Черный цвет placeholder
                                                    },
                                                },
                                            }}
                                        />
                                    </Form.Group>

                                    {/* Стоимость */}
                                    <Form.Group className="mb-3">
                                        <Form.Label>Общая стоимость</Form.Label>
                                        <TextField
                                            sx={{
                                                // Стили для обычного состояния
                                                '& .MuiInputBase-input': {
                                                    color: 'black', // Черный цвет текста
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'black', // Черный цвет рамки
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: 'black', // Черный цвет placeholder
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: 'black', // Черный цвет placeholder при фокусе
                                                },

                                                // Стили для disabled состояния
                                                '& .MuiInputBase-root.Mui-disabled': {
                                                    '& .MuiInputBase-input': {
                                                        color: 'black', // Черный цвет текста, даже если disabled
                                                        WebkitTextFillColor: 'black', // Для Safari и других браузеров на WebKit
                                                    },
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'black', // Черный цвет рамки
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        color: 'black', // Черный цвет placeholder
                                                    },
                                                },
                                            }}
                                            type="text"
                                            name="totalCost"
                                            value={announcement.totalCost}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                            className="form-control-placeholder w-100"
                                        />
                                    </Form.Group>

                                    {/* Цена по договору */}
                                    <Form.Group className="mb-3" hidden={true}>
                                        <Form.Label>Цена по договору</Form.Label>
                                        <Form.Select
                                            style={{
                                                backgroundColor: "#333",
                                                color: "white",
                                                border: "1px solid #555",
                                            }}
                                            name="isNonFixedPrice"
                                            value={announcement.isNonFixedPrice ? "Да" : "Нет"}
                                            onChange={(e) =>
                                                handleInputChange({
                                                    target: {name: "isNonFixedPrice", value: e.target.value === "Да"},
                                                })
                                            }
                                            disabled={!isEditable}
                                        >
                                            <option>Да</option>
                                            <option>Нет</option>
                                        </Form.Select>
                                    </Form.Group>

                                    {/* Метро */}
                                    <Form.Group className="mb-3">
                                        <Form.Label>Ближайшее метро</Form.Label>
                                        <TextField
                                            sx={{
                                                // Стили для обычного состояния
                                                '& .MuiInputBase-input': {
                                                    color: 'black', // Черный цвет текста
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'black', // Черный цвет рамки
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: 'black', // Черный цвет placeholder
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: 'black', // Черный цвет placeholder при фокусе
                                                },

                                                // Стили для disabled состояния
                                                '& .MuiInputBase-root.Mui-disabled': {
                                                    '& .MuiInputBase-input': {
                                                        color: 'black', // Черный цвет текста, даже если disabled
                                                        WebkitTextFillColor: 'black', // Для Safari и других браузеров на WebKit
                                                    },
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'black', // Черный цвет рамки
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        color: 'black', // Черный цвет placeholder
                                                    },
                                                },
                                            }}
                                            type="text"
                                            name="metro"
                                            value={announcement.metro}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                            className="form-control-placeholder w-100"
                                        />
                                    </Form.Group>

                                    {/* Адрес */}
                                    <Form.Group className="mb-3">
                                        <Form.Label>Полный адрес</Form.Label>
                                        <TextField
                                            type="text"
                                            name="address"
                                            value={announcement.address}
                                            onChange={handleInputChange}
                                            fullWidth
                                            disabled={!isEditable}
                                            className="form-control-placeholder"
                                            multiline
                                            sx={{
                                                // Стили для обычного состояния
                                                '& .MuiInputBase-input': {
                                                    color: 'black', // Черный цвет текста
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'black', // Черный цвет рамки
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: 'black', // Черный цвет placeholder
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: 'black', // Черный цвет placeholder при фокусе
                                                },

                                                // Стили для disabled состояния
                                                '& .MuiInputBase-root.Mui-disabled': {
                                                    '& .MuiInputBase-input': {
                                                        color: 'black', // Черный цвет текста, даже если disabled
                                                        WebkitTextFillColor: 'black', // Для Safari и других браузеров на WebKit
                                                    },
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'black', // Черный цвет рамки
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        color: 'black', // Черный цвет placeholder
                                                    },
                                                },
                                            }}
                                            minRows={1}
                                            maxRows={4}
                                        />
                                    </Form.Group>

                                    {/* Даты */}
                                    <Row className="g-3 mb-3">
                                        <Col xs={12} md={6}>
                                            <Form.Group>
                                                <Form.Label>Дата начала</Form.Label>
                                                <TextField
                                                    sx={{
                                                        // Стили для обычного состояния
                                                        '& .MuiInputBase-input': {
                                                            color: 'black', // Черный цвет текста
                                                        },
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: 'black', // Черный цвет рамки
                                                        },
                                                        '& .MuiInputLabel-root': {
                                                            color: 'black', // Черный цвет placeholder
                                                        },
                                                        '& .MuiInputLabel-root.Mui-focused': {
                                                            color: 'black', // Черный цвет placeholder при фокусе
                                                        },

                                                        // Стили для disabled состояния
                                                        '& .MuiInputBase-root.Mui-disabled': {
                                                            '& .MuiInputBase-input': {
                                                                color: 'black', // Черный цвет текста, даже если disabled
                                                                WebkitTextFillColor: 'black', // Для Safari и других браузеров на WebKit
                                                            },
                                                            '& .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: 'black', // Черный цвет рамки
                                                            },
                                                            '& .MuiInputLabel-root': {
                                                                color: 'black', // Черный цвет placeholder
                                                            },
                                                        },
                                                    }}

                                                    type="date"
                                                    name="startDate"
                                                    value={announcement.startDate}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditable}
                                                    className="form-control-placeholder w-100"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12} md={6}>
                                            <Form.Group>
                                                <Form.Label>Дата окончания</Form.Label>
                                                <TextField
                                                    sx={{
                                                        // Стили для обычного состояния
                                                        '& .MuiInputBase-input': {
                                                            color: 'black', // Черный цвет текста
                                                        },
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: 'black', // Черный цвет рамки
                                                        },
                                                        '& .MuiInputLabel-root': {
                                                            color: 'black', // Черный цвет placeholder
                                                        },
                                                        '& .MuiInputLabel-root.Mui-focused': {
                                                            color: 'black', // Черный цвет placeholder при фокусе
                                                        },

                                                        // Стили для disabled состояния
                                                        '& .MuiInputBase-root.Mui-disabled': {
                                                            '& .MuiInputBase-input': {
                                                                color: 'black', // Черный цвет текста, даже если disabled
                                                                WebkitTextFillColor: 'black', // Для Safari и других браузеров на WebKit
                                                            },
                                                            '& .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: 'black', // Черный цвет рамки
                                                            },
                                                            '& .MuiInputLabel-root': {
                                                                color: 'black', // Черный цвет placeholder
                                                            },
                                                        },
                                                    }}
                                                    type="date"
                                                    name="finishDate"
                                                    value={announcement.finishDate}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditable}
                                                    className="form-control-placeholder w-100"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {/* Комментарий */}
                                    <Form.Group className="mb-3">
                                        <Form.Label>Комментарий</Form.Label>
                                        <TextField
                                            type="text"
                                            name="comments"
                                            placeholder="Добавьте комментарий"
                                            value={announcement.comments}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                            // className="form-control-placeholder"
                                            multiline
                                            minRows={1}
                                            maxRows={4}
                                            fullWidth
                                            sx={{
                                                // Стили для обычного состояния
                                                '& .MuiInputBase-input': {
                                                    color: 'black', // Черный цвет текста
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'black', // Черный цвет рамки
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: 'black', // Черный цвет placeholder
                                                },
                                                '& .MuiInputLabel-root.Mui-focused': {
                                                    color: 'black', // Черный цвет placeholder при фокусе
                                                },

                                                // Стили для disabled состояния
                                                '& .MuiInputBase-root.Mui-disabled': {
                                                    '& .MuiInputBase-input': {
                                                        color: 'black', // Черный цвет текста, даже если disabled
                                                        WebkitTextFillColor: 'black', // Для Safari и других браузеров на WebKit
                                                    },
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: 'black', // Черный цвет рамки
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        color: 'black', // Черный цвет placeholder
                                                    },
                                                },
                                            }}
                                        />
                                    </Form.Group>
                                </Form>


                                <Row>
                                    <Col>
                                        <h5 className="mt-2 mb-4 text-center" style={{color: "#ff7f00"}}>
                                            Прикрепленные фотографии
                                        </h5>

                                        {images.length > 0 ? (
                                            <Row className="g-3">
                                                {announcement.announcementImages.map((imagePath, index) => (
                                                    <Col key={index} xs={6} md={4} lg={3}
                                                         style={{position: "relative"}}>
                                                        <Image
                                                            src={images[index]}
                                                            alt={`Фото ${index + 1}`}
                                                            fluid
                                                            rounded
                                                            style={{
                                                                width: "150px",
                                                                height: "150px",
                                                                objectFit: "cover",
                                                                cursor: "pointer",
                                                            }}
                                                            onClick={() => handleImageClick(images[index])}
                                                        />
                                                        {isEditable && (
                                                            <Button
                                                                variant="danger"
                                                                style={{
                                                                    position: "absolute",
                                                                    top: "5px",
                                                                    right: "5px",
                                                                    borderRadius: "50%",
                                                                    width: "20px",
                                                                    height: "20px",
                                                                    padding: "0",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                }}
                                                                onClick={() => handleDeleteImage(imagePath)}
                                                            >
                                                                ×
                                                            </Button>
                                                        )}
                                                    </Col>
                                                ))}
                                            </Row>
                                        ) : (
                                            <p className='text-center'>Фотографии отсутствуют</p>
                                        )}
                                    </Col>
                                </Row>

                                {isEditable && (
                                    <Row className="mt-4">
                                        <Col>
                                            <h6>Добавить новые фотографии:</h6>
                                            <Form.Control
                                                type="file"
                                                accept=".jpeg,.png,.jpg,.svg,"
                                                multiple
                                                onChange={handleAddImages}
                                                // hidden={uploading}
                                                style={{
                                                    // backgroundColor: "#333",
                                                    // color: "white",
                                                    border: "1px solid #555",
                                                }}
                                            />

                                            {newImages.length > 0 && (
                                                <div className="mt-3">
                                                    <h6>Выбранные фотографии:</h6>
                                                    <ul>
                                                        {newImages.map((file, index) => (
                                                            <li key={index}>{file.name}</li>
                                                        ))}
                                                    </ul>
                                                    <div className="d-flex gap-2">

                                                        <Button
                                                            variant="success"
                                                            onClick={handleUploadImages}
                                                            className="w-50"
                                                            // className="me-2 "
                                                        >
                                                            Сохранить
                                                        </Button>
                                                        <Button variant="danger" onClick={handleCancelUpload}
                                                                className="w-50">

                                                            Отменить
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </Col>
                                    </Row>
                                )}

                                {selectedImage && (
                                    <Modal
                                        show={!!selectedImage}
                                        onHide={handleCloseImageModal}
                                        centered
                                        size="lg"
                                    >
                                        <Modal.Body className="p-0">
                                            <Image
                                                src={selectedImage}
                                                alt="Просмотр изображения"
                                                fluid
                                                rounded
                                            />
                                        </Modal.Body>
                                    </Modal>
                                )}

                                <div className="mt-4">
                                    <h5 className="text-center" style={{color: "#ff7f00"}}>
                                        Прикрепленные файлы
                                    </h5>

                                    {files.length > 0 ? (
                                        <ul style={{paddingLeft: "1px", listStyleType: "none"}}>
                                            {files.map((file, index) => (
                                                <li
                                                    key={index}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "5px",
                                                        marginBottom: "5px",
                                                    }}
                                                >
                                                    <span>📄</span>
                                                    <span
                                                        style={{
                                                            cursor: "pointer",
                                                            color: "grey",
                                                            textDecoration: "underline",
                                                            whiteSpace: "nowrap", // Запрет переноса текста
                                                            overflow: "hidden", // Скрытие текста, выходящего за пределы
                                                            textOverflow: "ellipsis", // Добавление троеточия
                                                            maxWidth: "200px", // Максимальная ширина текста
                                                            flex: 1, // Занимает всё доступное пространство
                                                        }}
                                                        onClick={() =>
                                                            handleDownloadFile(file.storedFileName, file.originalFileName)
                                                        }
                                                    >
                                                        {file.originalFileName}
                                                    </span>
                                                    {isEditable && (
                                                        <Button
                                                            onClick={() => handleDeleteFile(file.storedFileName)}
                                                            variant="danger"
                                                            style={{
                                                                padding: "5px",
                                                                marginLeft: "auto"
                                                            }} // Прижимаем кнопку к правому краю
                                                        >
                                                            <Delete
                                                                sx={{fontSize: "20px"}}/> {/* Уменьшаем размер иконки */}
                                                        </Button>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-center mb-4">Файлы отсутствуют</p>
                                    )}
                                </div>

                                {isEditable && (
                                    <div style={{marginTop: "20px"}}>
                                        <h6>Добавить новые файлы:</h6>
                                        <Form.Control
                                            type="file"
                                            accept=".doc,.docx,.xls,.xlsx,.pdf"
                                            multiple
                                            onChange={handleAddFiles}
                                            style={{
                                                // backgroundColor: "#333",
                                                // color: "white",
                                                border: "1px solid #555",
                                            }}
                                        />
                                        {newFiles.length > 0 && (
                                            <div className="mt-3">
                                                <h6>Выбранные файлы:</h6>
                                                <ul style={{paddingLeft: "20px", listStyleType: "none"}}>
                                                    {newFiles.map((file, index) => (
                                                        <li
                                                            key={index}
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "10px",
                                                                marginBottom: "10px",
                                                            }}
                                                        >
                                                            <span>📄</span>
                                                            <span
                                                                style={{
                                                                    whiteSpace: "nowrap", // Запрет переноса текста
                                                                    overflow: "hidden", // Скрытие текста, выходящего за пределы
                                                                    textOverflow: "ellipsis", // Добавление троеточия
                                                                    maxWidth: "200px", // Максимальная ширина текста
                                                                }}
                                                            >
                                                                {file.name}
                                                            </span>
                                                            <Button
                                                                onClick={() => handleRemoveNewFile(index)}
                                                                variant='danger'
                                                                style={{
                                                                    padding: "5px",
                                                                    marginLeft: "auto"
                                                                }} // Прижимаем кнопку к правому краю

                                                            >
                                                                <Delete
                                                                    sx={{fontSize: "20px"}}/> {/* Уменьшаем размер иконки */}

                                                            </Button>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <div className="d-flex gap-2">
                                                    <Button variant="danger"
                                                            className="w-100"
                                                            onClick={() => setNewFiles([])}>
                                                        Отменить
                                                    </Button>
                                                    <Button
                                                        variant="success"
                                                        onClick={handleUploadFiles}
                                                        className="w-100"
                                                    >
                                                        Сохранить
                                                    </Button>

                                                </div>


                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className='mt-3'>
                                    {location.state?.fromLk === null ? null : (
                                        <div>
                                            {!isEditable && canEditOrDelete ? (
                                                <>
                                                    <h5 className="text-center mb-2" style={{color: "#ff7f00"}}>Данные
                                                        по лицу</h5>

                                                    {/* <h3>Данные по лицу</h3> */}
                                                    {!entityId ?
                                                        (
                                                            <div>
                                                                <div className="mb-4">Выберите лицо, которое хотите
                                                                    привязать
                                                                </div>
                                                                <EntityCard onSelectEntity={handleSelectEntity}/>
                                                                <Button
                                                                    className='mt-2 w-100'
                                                                    variant='success'
                                                                    onClick={() => handleEventEntity("link")}>Привязать
                                                                    лицо</Button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {entityData ? (
                                                                    isLegalEntity ? (
                                                                        <div>
                                                                            <h5 style={{textAlign: 'center'}}>Ваше
                                                                                юридическое лицо</h5>
                                                                            <div
                                                                                style={{
                                                                                    padding: '10px',
                                                                                    margin: '5px 0',
                                                                                    // backgroundColor: 'grey',
                                                                                    border: '1px solid green',
                                                                                    borderRadius: '5px',
                                                                                    cursor: 'pointer',
                                                                                }}
                                                                            >
                                                                                <strong>{entityData.firm}</strong>
                                                                                <p>ИНН: {entityData.inn}</p>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div>
                                                                            <h5 style={{textAlign: 'center'}}>Ваше
                                                                                физическое лицо</h5>
                                                                            <div
                                                                                style={{
                                                                                    padding: '10px',
                                                                                    margin: '5px 0',
                                                                                    // backgroundColor: 'grey',
                                                                                    border: '1px solid green',
                                                                                    borderRadius: '5px',
                                                                                    cursor: 'pointer',
                                                                                }}
                                                                            >
                                                                                <strong>{entityData.fullName}</strong>
                                                                                <p>ИНН: {entityData.inn}</p>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                ) : (
                                                                    <div>Загрузка данных лица...</div>
                                                                )}

                                                                {/* Контейнер для кнопок */}
                                                                <div style={{
                                                                    width: "100%",
                                                                    boxSizing: "border-box",
                                                                    marginTop: "3px"
                                                                }}>
                                                                    {/* Кнопка "Отвязать лицо" */}
                                                                    <Button
                                                                        variant='danger'

                                                                        className='mt-2 w-100'
                                                                        onClick={() => handleEventEntity("unlink")}
                                                                    >
                                                                        Отвязать лицо
                                                                    </Button>

                                                                    {/* Кнопка "Привязать лицо" */}

                                                                </div>
                                                            </>
                                                        )
                                                    }
                                                    <ButtonGroup style={styles.buttonContainer}>
                                                        <Button
                                                            onClick={handleDeleteClick}
                                                            // style={styles.deleteButton}
                                                            variant='danger'
                                                        >
                                                            <Delete/>
                                                        </Button>
                                                        <Button
                                                            onClick={handleEditClick}
                                                            // style={styles.editButton}
                                                            variant='success'
                                                        >
                                                            Редактировать
                                                        </Button>


                                                    </ButtonGroup>
                                                </>


                                            ) : isEditable ? (
                                                <ButtonGroup style={styles.buttonContainer}>
                                                    <Button
                                                        onClick={handleSaveClick}
                                                        // style={styles.editButton}
                                                        variant='success'
                                                    >
                                                        Сохранить
                                                    </Button>
                                                </ButtonGroup>
                                            ) : (
                                                <Button onClick={handleOpenReaction} style={styles.editButton}>
                                                    Откликнуться
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <ReactionWindow
                                    isOpen={isModalOpen} onClose={closeModal}
                                    userId={announcement.userId}
                                    id={announcement.id}
                                    mode={0}
                                    receiverItemName={announcement.workCategories}
                                />


                            </Card.Body>
                        </Card>

                        {/* Стили для серого плейсхолдера */}
                        <style>
                            {`
                .form-control-placeholder::placeholder {
                  color: #bbb;
                }
              `}
                        </style>

                    </Col>
                </Row>
            </Container>

        </div>
    );

};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px', // промежуток между элементами
        // maxWidth: '400px', // ширина контейнера
        margin: '0 auto', // центрирование на странице
    },
    input: {
        width: '100%',
        padding: '8px',
        marginTop: '4px',
        boxSizing: 'border-box',
    },
    buttonContainer: {
        display: 'flex',
        gap: "10px", // Расстояние между кнопками
        justifyContent: 'center', // Выравнивание по центру
        marginTop: '12px', // Отступ сверху
    },
    editButton: {
        backgroundColor: '#4caf50',
        flex: 8,
        border: 'none',
        color: 'white',
        fontWeight: 'bold',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        width: '100%'
    },
    deleteButton: {
        backgroundColor: '#f44336',
        border: 'none',
        color: 'white',
        fontWeight: 'bold',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    fixedButton: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

};

export default AnnouncementDetails;
