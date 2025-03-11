import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ReactionWindow from '../Agreement/Reaction';
import { useProfile } from '../../Context/ProfileContext';
import TopBar from '../TopBar/TopBar';
import EntityCard from '../../Previews/EntityCard'
import { Button, Card, Container, Form, ListGroup, Row, Col, Spinner } from "react-bootstrap";
import { useToast } from '../../Notification/ToastContext'


const AnnouncementDetails = () => {
    const showToast = useToast();

    const { id } = useParams();
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
    const { isSpecialist } = useProfile();
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
                const params = new URLSearchParams({ announcementId: id });
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
                    // console.log('asdasdad',announcement.)

                    // Шаг 2: Получение данных лица
                    const entityId = data.announcementInfo.entityId; // Получаем ID лица из объявления
                    setEntityId(entityId);
                    if (entityId) {
                        const fetchEntity = async (id) => {
                            const entityParams = new URLSearchParams({ customerId: id });
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
                        showToast("Не выбрано лицо в данных объявления", "error")

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
                        const params = new URLSearchParams({ imagePath });
                        const response = await fetch(`${url}/announcement/image?${params.toString()}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${getAuthToken()}`,
                            },
                        });

                        if (!response.ok) {
                            // console.error(`Ошибка загрузки изображения: ${imagePath}`);
                            showToast("Ошибка загрузки изображения", "error")

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
            const params = new URLSearchParams({ filePath: storedFileName });
            const response = await fetch(`${url}/announcement/document?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
            });

            if (!response.ok) {
                showToast("Ошибка скачивания файла", "error")
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
            showToast("Не удалось скачать файл", "error")
        }
    };

    const handleDeleteFile = async (storedFileName) => {
        if (window.confirm('Вы уверены, что хотите удалить этот файл?')) {
            try {
                const params = new URLSearchParams({ filePath: storedFileName });
                const response = await fetch(`${url}/announcement/file?${params.toString()}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${getAuthToken()}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка удаления файла: ${response.status}`);
                }

                // alert('Файл успешно удален.');
                showToast("Файл успешно удален", "success")

                setFiles((prevFiles) => prevFiles.filter((file) => file.storedFileName !== storedFileName));
            } catch (error) {
                // console.error('Ошибка удаления файла:', error);
                // alert('Не удалось удалить файл.');
                showToast("Не удалось удалить файл", "error")

            }
        }
    };

    const handleUploadFiles = async () => {
        if (newFiles.length === 0) {
            // alert('Вы не выбрали файлы для загрузки.');
            showToast("Вы не выбрали файлы для загрузки", "error")
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
            showToast("Не удалось загрузить файлы", "error")

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
        const { name, value } = e.target;
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
            showToast("Ошибка создания объявления", "error")
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
            showToast("Не удалось загрузить фотографии", "error")
        }
    };


    const handleDeleteImage = async (filePath) => {
        if (window.confirm('Вы уверены, что хотите удалить это фото?')) {
            try {
                const params = new URLSearchParams({ filePath });
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
                showToast("Не удалось удалить изображение", "error")

            }
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
            showToast("Ошибка при слхранении", "error")

        }
    };

    const handleDeleteClick = async () => {
        if (window.confirm('Вы уверены, что хотите удалить объявление?')) {
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
                showToast("Ошибка удаления", "error")

            }
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
                    body: JSON.stringify({ announcementId: id, mode: "link", entityId: selectedEntityId }),
                });

                if (!response.ok) {
                    throw new Error(`Ошибка применения изменения: ${response.status}`);
                }

            } catch (error) {
                // console.error('Ошибка применения изменения:', error);
                // alert('Не удалось одобрить изменение.');
                showToast("Не удалось одобрить изменение", "error")

            }
        }
        else if (mode === "unlink") {//
            try {
                const response = await fetch(`${url}/announcement/entity`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                    body: JSON.stringify({ announcementId: id, mode: "unlink" }),
                });

                if (!response.ok) {
                    throw new Error(`Ошибка применения изменения: ${response.status}`);
                }

                // alert('Лицо успешно отвязано!');
                showToast("Лицо успешно отвязано", "success")

            } catch (error) {
                // console.error('Ошибка привязки лица:', error);
                showToast("Ошибка привязки лица", "error")

                // alert('Не удалось одобрить изменение.');
            }
        }
        setTrigger(!trigger)
    }

    const handleSelectEntity = (id) => {
        setSelectedEntityId(id);
        // console.log(id)
    };

    if (loading) return <div>Загрузка данных анкеты...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <TopBar />
            <Container
                fluid
                style={{
                    backgroundColor: "#242582",
                    flex: 1,
                    padding: "20px",
                }}
            >
                <Row className="justify-content-center">
                    <Col md={8}>
                        <Card
                            style={{
                                backgroundColor: "#222",
                                color: "white",
                                borderRadius: "12px",
                                padding: "20px",
                                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
                            }}
                        >
                            <Card.Body>
                                <h2 className="text-center mb-4" style={{ color: "#ff7f00", fontWeight: "bold" }}>
                                    Детали объявления
                                </h2>
                                <Form>
                                    {/* Категории работ */}
                                    <Form.Group className="mb-3">
                                        <Form.Label>Категории работ</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="workCategories"
                                            value={announcement.workCategories}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                            className="form-control-placeholder"
                                        />
                                    </Form.Group>

                                    {/* Стоимость */}
                                    <Form.Group className="mb-3">
                                        <Form.Label>Общая стоимость</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="totalCost"
                                            value={announcement.totalCost}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                            className="form-control-placeholder"
                                        />
                                    </Form.Group>

                                    {/* Цена по договору */}
                                    <Form.Group className="mb-3">
                                        <Form.Label>Цена по договору</Form.Label>
                                        <Form.Select
                                            name="isNonFixedPrice"
                                            value={announcement.isNonFixedPrice ? "Да" : "Нет"}
                                            onChange={(e) =>
                                                handleInputChange({
                                                    target: { name: "isNonFixedPrice", value: e.target.value === "Да" },
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
                                        <Form.Control
                                            type="text"
                                            name="metro"
                                            value={announcement.metro}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                            className="form-control-placeholder"
                                        />
                                    </Form.Group>

                                    {/* Адрес */}
                                    <Form.Group className="mb-3">
                                        <Form.Label>Полный адрес</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="address"
                                            value={announcement.address}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                            className="form-control-placeholder"
                                        />
                                    </Form.Group>

                                    {/* Даты */}
                                    <Row className="g-3 mb-3">
                                        <Col xs={12} md={6}>
                                            <Form.Group>
                                                <Form.Label>Дата начала</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="startDate"
                                                    value={announcement.startDate}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditable}
                                                    className="form-control-placeholder"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12} md={6}>
                                            <Form.Group>
                                                <Form.Label>Дата окончания</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="finishDate"
                                                    value={announcement.finishDate}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditable}
                                                    className="form-control-placeholder"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {/* Комментарий */}
                                    <Form.Group className="mb-3">
                                        <Form.Label>Комментарий</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            name="comments"
                                            placeholder="Добавьте комментарий"
                                            value={announcement.comments}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                            className="form-control-placeholder"
                                        />
                                    </Form.Group>
                                </Form>

                                <div>
                                    <div>
                                        <h4>Прикрепленные фотографии:</h4>
                                        {images.length > 0 ? (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                                {announcement.announcementImages.map((imagePath, index) => (
                                                    <div key={index} style={{ position: 'relative', display: 'inline-block' }}>
                                                        <img
                                                            src={images[index]}
                                                            alt={`Фото ${index + 1}`}
                                                            style={{
                                                                width: '150px',
                                                                height: '150px',
                                                                objectFit: 'cover',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                            }}
                                                            onClick={() => handleImageClick(images[index])} // Открытие модального окна
                                                        />
                                                        {isEditable && (
                                                            <button
                                                                onClick={() => handleDeleteImage(imagePath)}
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: '5px',
                                                                    right: '5px',
                                                                    background: 'red',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '50%',
                                                                    width: '20px',
                                                                    height: '20px',
                                                                    cursor: 'pointer',
                                                                }}
                                                            >
                                                                ×
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p>Фотографии отсутствуют</p>
                                        )}
                                    </div>

                                    {isEditable && (
                                        <div style={{ marginTop: '20px' }}>
                                            <h4>Добавить новые фотографии:</h4>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleAddImages}
                                            />
                                            {newImages.length > 0 && (
                                                <div>
                                                    <h5>Выбранные фотографии:</h5>
                                                    <ul>
                                                        {newImages.map((file, index) => (
                                                            <li key={index}>{file.name}</li>
                                                        ))}
                                                    </ul>
                                                    <button onClick={handleUploadImages} style={{ marginRight: '10px', background: 'green', color: 'white', padding: '10px' }}>
                                                        Отправить
                                                    </button>
                                                    <button onClick={handleCancelUpload} style={{ background: 'red', color: 'white', padding: '10px' }}>
                                                        Отменить
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedImage && (
                                        <div
                                            onClick={handleCloseImageModal}
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
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <img
                                                src={selectedImage}
                                                alt="Просмотр изображения"
                                                style={{
                                                    maxWidth: '90%',
                                                    maxHeight: '90%',
                                                    borderRadius: '10px',
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h4>Прикрепленные файлы:</h4>
                                    {files.length > 0 ? (
                                        <ul>
                                            {files.map((file, index) => (
                                                <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span>📄</span>
                                                    <span
                                                        style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                                                        onClick={() => handleDownloadFile(file.storedFileName, file.originalFileName)}
                                                    >
                                                        {file.originalFileName}
                                                    </span>
                                                    {isEditable && (
                                                        <button
                                                            onClick={() => handleDeleteFile(file.storedFileName)}
                                                            style={{ background: 'red', color: 'white', border: 'none', padding: '5px', cursor: 'pointer' }}
                                                        >
                                                            Удалить
                                                        </button>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>Файлы отсутствуют</p>
                                    )}
                                </div>

                                {isEditable && (
                                    <div style={{ marginTop: '20px' }}>
                                        <h4>Добавить новые файлы:</h4>
                                        <input
                                            type="file"
                                            accept=".doc,.docx,.xls,.xlsx,.pdf" // Поддерживаемые форматы
                                            multiple
                                            onChange={handleAddFiles}
                                        />
                                        {newFiles.length > 0 && (
                                            <div>
                                                <h5>Выбранные файлы:</h5>
                                                <ul>
                                                    {newFiles.map((file, index) => (
                                                        <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            📄 {file.name}
                                                            <button
                                                                onClick={() => handleRemoveNewFile(index)}
                                                                style={{ background: 'red', color: 'white', border: 'none', padding: '5px', cursor: 'pointer' }}
                                                            >
                                                                Удалить
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                                <button
                                                    onClick={handleUploadFiles}
                                                    style={{ marginRight: '10px', background: 'green', color: 'white', padding: '10px' }}
                                                >
                                                    Отправить
                                                </button>
                                                <button
                                                    onClick={() => setNewFiles([])}
                                                    style={{ background: 'red', color: 'white', padding: '10px' }}
                                                >
                                                    Отменить
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}


                                <div>
                                    {location.state?.fromLk === null ? null : (
                                        <div>
                                            {!isEditable && canEditOrDelete ? (
                                                <>

                                                    {/* <h3>Данные по лицу</h3> */}
                                                    {!entityId ?
                                                        (
                                                            <div>
                                                                <div>Лицо не привязано</div>
                                                                <EntityCard onSelectEntity={handleSelectEntity} />
                                                                <button onClick={() => handleEventEntity("link")}>Привязать лицо</button>

                                                            </div>
                                                        ) : (
                                                            <>
                                                                {entityData ? (
                                                                    isLegalEntity ? (
                                                                        <div>
                                                                            <h3 style={{ textAlign: 'center', color: 'white' }}>Ваше юридическое лицо</h3>
                                                                            <div
                                                                                style={{
                                                                                    padding: '10px',
                                                                                    margin: '5px 0',
                                                                                    backgroundColor: '#4114f5',
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
                                                                            <h3 style={{ textAlign: 'center', color: 'white' }}>Ваше физическое лицо</h3>
                                                                            <div
                                                                                style={{
                                                                                    padding: '10px',
                                                                                    margin: '5px 0',
                                                                                    backgroundColor: '#4114f5',
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

                                                                <button onClick={() => handleEventEntity("unlink")}>Отвязать лицо</button>
                                                            </>
                                                        )
                                                    }

                                                    <button onClick={handleEditClick} style={styles.button}>
                                                        Редактировать
                                                    </button>
                                                    <button onClick={handleDeleteClick} style={styles.deleteButton}>
                                                        Удалить
                                                    </button>
                                                </>
                                            ) : isEditable ? (
                                                <button onClick={handleSaveClick} style={styles.button}>
                                                    Сохранить
                                                </button>
                                            ) : (
                                                <button onClick={handleOpenReaction} style={styles.button}>
                                                    Откликнуться
                                                </button>
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
                    </Col>
                </Row>

                {/* Стили для серого плейсхолдера */}
                <style>
                    {`
                .form-control-placeholder::placeholder {
                  color: #bbb;
                }
              `}
                </style>
            </Container>
        </div>
    );

};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px', // промежуток между элементами
        maxWidth: '400px', // ширина контейнера
        margin: '0 auto', // центрирование на странице
    },
    input: {
        width: '100%',
        padding: '8px',
        marginTop: '4px',
        boxSizing: 'border-box',
    },
    button: {
        marginTop: '20px',
        padding: '10px',
    },
    deleteButton: {
        padding: '10px',
        backgroundColor: 'red',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
    },

};

export default AnnouncementDetails;
