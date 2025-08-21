import React, {useEffect, useState} from 'react';
import {useParams, useLocation, useNavigate} from 'react-router-dom';
import ReactionWindow from '../Agreement/Reaction';
import TopBar from '../../TopBars/UnswitchTopBar.jsx';
import EntityCard from '../../Previews/EntityCard'
import {useToast} from '../../Notification/ToastContext'
import {Button, Card, Container, Form, Row, Col, Image, Modal, ButtonGroup, Spinner} from "react-bootstrap";
import TextField from "@mui/material/TextField";
import {FaArrowLeft} from 'react-icons/fa';
import {Delete} from '@mui/icons-material';
import ErrorMessage from "../../ErrorHandling/ErrorMessage.jsx";
import LoadingPlug from "../../LoadingPlug/LoadingPlug.jsx";
import {useProfile} from "../../Context/ProfileContext.jsx";

const AnnouncementDetails = () => {
    const showToast = useToast();
    const {isSpecialist} = useProfile();

    const {id} = useParams();
    const [announcement, setAnnouncement] = useState({});
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
    const canEditOrDelete = location.state?.fromLk || false;

    const [trigger, setTrigger] = useState(false);

    const [images, setImages] = useState([]);
    const [newImages, setNewImages] = useState([]);

    const [selectedImage, setSelectedImage] = useState(null);

    const [files, setFiles] = useState([]);
    const [newFiles, setNewFiles] = useState([]);

    const [announcementError, setAnnouncementError] = useState(null);
    const [filesError, setFilesError] = useState(null);
    const [imagesError, setImagesError] = useState(null);
    const [isMine, setIsMine] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const params = new URLSearchParams({id: id});
            const response = await fetch(`${url}/announcement/is-mine?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
            });

            const data = await response.json();
            await setIsMine(data.success)
        }
        fetchData()
    }, [id]);

    useEffect(() => {

        const fetchData = async () => {
            const params = new URLSearchParams({announcementId: id});
            const response = await fetch(`${url}/announcement?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                if (data.success === 1 && data.announcementInfo) {
                    setAnnouncement(data.announcementInfo);

                    //шаг2
                    const entityId = data.announcementInfo.entityId; // Получаем ID лица из объявления
                    setEntityId(entityId);
                    if (entityId) {
                        const fetchEntity = async (id) => {
                            // const entityParams = new URLSearchParams({contractorId: id});
                            const entityResponse = await fetch(`${url}/entity/${id}`, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${getAuthToken()}`,
                                },
                            });

                            if (!entityResponse.ok) {
                                // throw new Error(`Ошибка при получении данных лица: ${entityResponse.status}`);
                            }

                            const entityData = await entityResponse.json();
                            setIsLegalEntity(entityData.isLegalEntity)
                            setEntityData(entityData)
                        };

                        await fetchEntity(entityId);
                    } else {
                        console.error('ID лица отсутствует в данных объявления');
                    }
                }
            } else {
                setAnnouncementError({message: data.userFriendlyMessage, status: data.status});
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
                        const blob = await (response.blob() || response.json());

                        if (response.ok) {
                            return URL.createObjectURL(blob); // Создаем объект URL для изображения

                        } else {
                            setImagesError({message: blob.userFriendlyMessage, status: blob.status});
                            return null
                        }

                    })
                );

                setImages(loadedImages.filter((img) => img !== null));
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

    const [legalEntities, setLegalEntities] = useState([]);
    const [persons, setPersons] = useState([]);
    useEffect(() => {
        const fetchGetEntitiesData = async () => {
            try {
                const params = new URLSearchParams({isSpecialist});
                const response = await fetch(`${url}/entity/all?${params.toString()}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status}`);
                }

                const data = await response.json();
                // data.length === 0 ? onGotPerson(false) : onGotPerson(true)

                const legalEntitiesData = [];
                const personsData = [];

                data.forEach(entity => {
                    if (entity.isLegalEntity) {
                        legalEntitiesData.push(entity);
                    } else {
                        personsData.push(entity);
                    }
                });

                setLegalEntities(legalEntitiesData);
                setPersons(personsData);
            } catch (error) {
                showToast("Ошибка при загрузке физических и юридических лиц", "danger")
            }
        };
        fetchGetEntitiesData();
    }, [isSpecialist, url]);

    const handleImageClick = (image) => {
        setSelectedImage(image);
    };

    const handleAddFiles = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setNewFiles((prev) => [...prev, ...selectedFiles]);
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

            const blob = await (response.blob() || response.json());

            if (response.ok) {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = originalFileName;
                link.click();
            } else {
                setFilesError({message: blob.userFriendlyMessage, status: blob.status});
            }

        } catch (error) {
            showToast("Не удалось скачать файл", "danger")
        }
    };

    const handleDeleteFile = async (storedFileName) => {

        const params = new URLSearchParams({filePath: storedFileName});
        const response = await fetch(`${url}/announcement/file?${params.toString()}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
            },
        });

        const data = await response.json();

        if (response.ok) {
            showToast("Файл успешно удален", "success")
            setFiles((prevFiles) => prevFiles.filter((file) => file.storedFileName !== storedFileName));

        } else {
            setFilesError({message: data.userFriendlyMessage, status: data.status});
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

            showToast("Файлы успешно загружены", "success")

            setNewFiles([]); // Очищаем локальное состояние
            setTrigger(!trigger); // Обновляем данные
        } catch (error) {

            showToast("Не удалось загрузить файлы", "danger")

        }
    };

    const handleCloseImageModal = () => {
        setSelectedImage(null); // Закрываем модальное окно
    };

    const handleAddImages = (e) => {
        const files = Array.from(e.target.files);
        setNewImages((prev) => [...prev, ...files]);
    };

    const handleEditClick = () => {
        setIsEditable(true);
    };

    const handleOpenReaction = () => {
        setIsModalOpen(true); // Открыть модальное окно
    };

    const closeModal = () => {
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
        if (!selectedEntityId && mode === 'link') {
            showToast("Вы не выбрали лицо, которое необходимо привязать", "info")
            return
        }
        if (mode === "link") {
            try {
                const response = await fetch(`${url}/announcement/entity`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                    body: JSON.stringify({announcementId: id, mode: "link", entityId: selectedEntityId}),
                });

                if (!response.ok) {
                    throw new Error(`Ошибка применения изменения: ${response.status}`);
                }

            } catch (error) {
                console.error('Ошибка применения изменения:', error);
                // alert('Не удалось одобрить изменение.');
                showToast("Не удалось одобрить изменение", "error")

            }
        } else if (mode === "unlink") {//
            try {
                const response = await fetch(`${url}/announcement/entity`, {
                    method: 'PATCH',
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
                showToast("Лицо успешно отвязано", "info")

            } catch (error) {
                // console.error('Ошибка привязки лица:', error);
                // alert('Не удалось одобрить изменение.');
                showToast("Ошибка привязки лица", "error")

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

    return (
        <div style={{display: "flex", flexDirection: "column", height: "100vh"}}>
            <TopBar/>
            <Container
                fluid
                style={{
                    // backgroundColor: "#242582",
                    flex: 1,
                    // padding: "20px",
                }}
                className="BG"
            >
                <Row className="justify-content-center">
                    <Col sm={10}
                         style={{padding: "20px"}}
                    >
                        {announcement && <Card
                            style={{
                                borderRadius: "12px",
                                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
                            }}
                            className='p-0'
                        >
                            <Card.Text className='p-0 m-0'>
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
                                <ErrorMessage
                                    message={announcementError?.message}
                                    statusCode={announcementError?.status}
                                />
                                <hr
                                    style={{
                                        height: '2px',
                                        background: "white",
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
                                            maxRows={10}
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
                                        <ErrorMessage
                                            message={imagesError?.message}
                                            statusCode={imagesError?.status}
                                        />
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
                                                            // maxWidth: "200px", // Максимальная ширина текста
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
                                                                    // maxWidth: "200px", // Максимальная ширина текста
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

                                {isMine &&
                                    <Card
                                        className='mt-4'
                                        style={{
                                            backgroundColor: "#222",
                                            color: "white",
                                            borderRadius: "12px",
                                            padding: "10px",
                                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
                                        }}
                                    >
                                        {
                                            // Если лицо привязано
                                            (entityId) ? (
                                                <>
                                                    <h5 className="text-center mb-2"
                                                        style={{color: "#ff7f00"}}>Привязанное лицо</h5>
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
                                                                    <p>ИНН: {entityData.INN}</p>
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
                                                                    <p>ИНН: {entityData.INN}</p>

                                                                </div>
                                                            </div>
                                                        )
                                                    ) : (
                                                        <Container className="text-center my-5">
                                                            <Spinner animation="border" variant="primary"/>
                                                        </Container>
                                                    )}

                                                    <div style={{
                                                        width: "100%",
                                                        boxSizing: "border-box",
                                                        marginTop: "3px"
                                                    }}>
                                                        <Button
                                                            variant='danger'
                                                            style={{width: '100%'}}
                                                            className='mt-2 w-100 filled-button'
                                                            onClick={() => handleEventEntity("unlink")}
                                                        >
                                                            Отвязать лицо
                                                        </Button>


                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <>
                                                        {!(persons.length === 0 && legalEntities.length === 0) ? (
                                                            <div>
                                                                <h5 className="text-center mb-4"
                                                                    style={{color: "#ff7f00"}}>Выберите
                                                                    лицо, которое хотите привязать
                                                                </h5>
                                                                <EntityCard
                                                                    onSelectEntity={handleSelectEntity}
                                                                    persons={persons}
                                                                    legalEntities={legalEntities}
                                                                />
                                                                <Button
                                                                    className='mt-2 w-100 unfilled-button'
                                                                    variant='success'
                                                                    onClick={() => handleEventEntity("link")}>
                                                                    Привязать лицо
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <h5 className='text-center'>Необходимо создать добавить
                                                                    физ/юр лицо для дальнейшей работы
                                                                </h5>

                                                                <Button onClick={() => {
                                                                    navigate('/account-actions?tab=personal-info')
                                                                }}>
                                                                    Создать лицо
                                                                </Button>
                                                            </>
                                                        )}
                                                    </>
                                                </>
                                            )

                                        }
                                    </Card>
                                }

                                {(isMine && !isSpecialist) ? <div className='mt-4'>
                                    {isEditable ? (
                                        <>
                                            <ButtonGroup style={styles.buttonContainer}>
                                                <Button
                                                    onClick={handleSaveClick}
                                                    className='w-100 unfilled-button'
                                                    // style={styles.editButton}
                                                    variant='success'
                                                >
                                                    Сохранить
                                                </Button>
                                            </ButtonGroup>
                                        </>
                                    ) : (
                                        <ButtonGroup style={styles.buttonContainer}>
                                            <Button
                                                onClick={handleDeleteClick}
                                                className='filled-button'
                                                style={{width: '5%'}}
                                                // variant='danger'
                                            >
                                                <Delete/>
                                            </Button>
                                            <Button
                                                onClick={handleEditClick}
                                                className='unfilled-button'
                                                // variant='success'
                                            >
                                                Редактировать
                                            </Button>
                                        </ButtonGroup>
                                    )}
                                </div> : (
                                    <div className='mt-4'>
                                        <Button onClick={handleOpenReaction} style={styles.editButton}>
                                            Откликнуться
                                        </Button>
                                    </div>
                                )}


                                {isModalOpen && <ReactionWindow
                                    isOpen={isModalOpen}
                                    onClose={closeModal}
                                    userId={announcement.userId}
                                    id={announcement.id}
                                    receiverEntityId={announcement.entityId}
                                    mode={0}
                                    receiverItemName={announcement.workCategories}

                                />}

                            </Card.Body>
                        </Card>}

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
