import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ReactionWindow from '../Agreement/Reaction';
import { useProfile } from '../../Context/ProfileContext';
import TopBar from '../TopBar/TopBar';
import EntityCard from '../../Previews/EntityCard'
import { useToast } from '../../Notification/ToastContext'
import { Button, Card, Container, Form, ListGroup, Row, Col, Spinner, Image, Modal, ButtonGroup } from "react-bootstrap";
import Swal from "sweetalert2";

const QuestionnaireDetails = () => {
    const showToast = useToast();

    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [questionnaire, setQuestionnaire] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditable, setIsEditable] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const url = localStorage.getItem('url');
    const getAuthToken = () => localStorage.getItem('authToken');
    const canEditOrDelete = location.state?.fromLk || false;

    const [entityId, setEntityId] = useState(null);
    const [isLegalEntity, setIsLegalEntity] = useState(null);
    const [entityData, setEntityData] = useState(null);
    const [selectedEntityId, setSelectedEntityId] = useState(null)

    const [trigger, setTrigger] = useState(false);

    const [images, setImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Шаг 1: Получение анкеты
                const params = new URLSearchParams({ questionnaireId: id });
                const response = await fetch(`${url}/questionnaire?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status}`);
                }

                const data = await response.json();

                if (data.success === 1 && data.questionnaireInfo) {
                    setQuestionnaire(data.questionnaireInfo);

                    //шаг2
                    const entityId = data.questionnaireInfo.entityId; // Получаем ID лица из объявления
                    setEntityId(entityId);
                    if (entityId) {
                        const fetchEntity = async (id) => {
                            const entityParams = new URLSearchParams({ contractorId: id });
                            const entityResponse = await fetch(`${url}/contractor?${entityParams.toString()}`, {
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
                        console.error('ID лица отсутствует в данных объявления');
                    }
                } else {
                    setError('Информация об анкете не найдена');
                }
            } catch (error) {
                setError(`Ошибка при загрузке данных: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, url, trigger]);

    useEffect(() => {
        const fetchImages = async () => {
            if (questionnaire?.questionnaireImages) {
                const loadedImages = await Promise.all(
                    questionnaire.questionnaireImages.map(async (imagePath) => {
                        const params = new URLSearchParams({ imagePath });
                        const response = await fetch(`${url}/questionnaire/image?${params.toString()}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${getAuthToken()}`,
                            },
                        });

                        if (!response.ok) {
                            console.error(`Ошибка загрузки изображения: ${imagePath}`);
                            return null;
                        }

                        const blob = await response.blob();
                        return URL.createObjectURL(blob); // Создаем объект URL для изображения
                    })
                );

                setImages(loadedImages.filter((img) => img !== null)); // Исключаем неудачные загрузки
            }
        };

        if (questionnaire) {
            fetchImages();
        }
    }, [questionnaire, url]);

    const handleEditClick = () => setIsEditable(true);
    const handleOpenReaction = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const handleImageClick = (image) => {
        setSelectedImage(image); // Устанавливаем выбранное изображение
    };

    const handleCloseImageModal = () => {
        setSelectedImage(null); // Закрываем модальное окно
    };

    const handleGoBack = () => {
        window.history.back();
    };

    const handleAddImages = (e) => {
        const files = Array.from(e.target.files);
        setNewImages((prev) => [...prev, ...files]); // Добавляем новые файлы к уже выбранным
    };

    const handleCancelUpload = () => {
        setNewImages([]); // Очищаем список новых фотографий
    };

    const handleUploadImages = async () => {
        if (newImages.length === 0) {
            // alert('Вы не выбрали фотографии для загрузки.');
            showToast("Вы не выбрали фотографии для загрузки", "error")
            return;
        }

        try {
            const formData = new FormData();
            newImages.forEach((file) => formData.append('files', file)); // Добавляем все выбранные файлы
            formData.append('questionnaireId', id); // Добавляем ID объявления
            formData.append('type', 'image');
            const response = await fetch(`${url}/questionnaire/files`, {
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
            showToast("Фотографии успешно загружены", "success")

            setNewImages([]); // Очищаем локальное состояние после успешной отправки
            setTrigger(!trigger); // Обновляем данные объявления
        } catch (error) {
            // console.error('Ошибка при загрузке фотографий:', error);
            // alert('Не удалось загрузить фотографии.');
            showToast("Не удалось загрузить фотографии", "error")

        }
    };

    const handleDeleteImage = async (filePath) => {
        Swal.fire({
            title: "Вы уверены, что хотите удалить изображение?",
            // text: "Сброшенные этапы невозможно будет восстановить",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Да, удалить!",
            cancelButtonText: "Отмена",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const params = new URLSearchParams({ filePath });
                    const response = await fetch(`${url}/questionnaire/file?${params.toString()}`, {
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
                    setQuestionnaire((prev) => ({
                        ...prev,
                        questionnaireImages: prev.questionnaireImages.filter((img) => img !== filePath),
                    }));
                } catch (error) {
                    // console.error('Ошибка при удалении изображения:', error);
                    // alert('Не удалось удалить изображение.');
                    showToast("Не удалось удалить изображение", "error")

                }
            }
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setQuestionnaire((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSaveClick = async () => {
        try {
            const response = await fetch(`${url}/questionnaire/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify(questionnaire),
            });

            if (!response.ok) {
                throw new Error(`Ошибка при сохранении: ${response.status}`);
            }

            const data = await response.json();
            showToast("Анкета была сохранения успешно", "success")

            if (data.success === 1) {
                setIsEditable(false);
            } else {
                // setError('Не удалось сохранить данные');
                showToast("Не удалось сохранить данные", "error")
            }
        } catch (error) {
            // setError(`Ошибка при сохранении: ${error.message}`);
            showToast("Ошибка при сохранении", "error")
        }
    };

    const handleDeleteClick = async () => {
        Swal.fire({
            title: "Вы уверены, что хотите удалить анкету?",
            // text: "Сброшенные этапы невозможно будет восстановить",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Да, удалить!",
            cancelButtonText: "Отмена",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const params = new URLSearchParams({ questionnaireId: id });

                    const response = await fetch(`${url}/questionnaire?${params.toString()}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${getAuthToken()}`,
                        },
                    });

                    showToast("", "error")

                    if (!response.ok) {
                        throw new Error(`Ошибка при удалении: ${response.status}`);
                    }

                    const data = await response.json();
                    if (data.success === 1) {
                        navigate('/account-actions');
                    } else {
                        setError('Не удалось удалить анкету');
                    }
                } catch (error) {
                    setError(`Ошибка при удалении: ${error.message}`);
                }
            }
        });
    };

    const handleEventEntity = async (mode) => {
        if (mode === "link") {//annId, mode, enityId
            try {
                const response = await fetch(`${url}/questionnaire/entity`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                    body: JSON.stringify({ questionnaireId: id, mode: "link", entityId: selectedEntityId }),
                });

                if (!response.ok) {
                    throw new Error(`Ошибка применения изменения: ${response.status}`);
                }

            } catch (error) {
                console.error('Ошибка применения изменения:', error);
                // alert('Не удалось одобрить изменение.');
                showToast("Не удалось одобрить изменение", "error")

            }
        }
        else if (mode === "unlink") {//
            try {
                const response = await fetch(`${url}/questionnaire/entity`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                    body: JSON.stringify({ questionnaireId: id, mode: "unlink" }),
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

    const handleSelectEntity = (id) => {
        setSelectedEntityId(id);
        // console.log(id)
    };


    if (loading) return <div>Загрузка данных анкеты...</div>;
    if (error) return <div>Ошибка: {error}</div>;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }} >
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
                    <Col md={8} style={{ padding: "20px" }}>
                        <Card
                            style={{
                                backgroundColor: "#222",
                                color: "white",
                                borderRadius: "12px",
                                padding: "20px",
                                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
                            }}
                        >
                            <Card.Text>
                                <Button
                                    onClick={handleGoBack}
                                    variant="secondary"
                                    style={{
                                        marginTop: '10px',
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        width: '100%'
                                    }}
                                >
                                    Назад
                                </Button>
                            </Card.Text>

                            <Card.Body >
                                <h2 className="text-center mb-4" style={{ color: "#ff7f00", fontWeight: "bold" }}>
                                    Детали анкеты
                                </h2>

                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Категории работ</Form.Label>
                                        <Form.Control
                                            type="text"
                                            style={{
                                                backgroundColor: "#333",
                                                color: "white",
                                                border: "1px solid #555",
                                            }}
                                            name="workCategories"
                                            id="workCategories"
                                            value={questionnaire.workCategories || ''}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                            // style={styles.input}
                                            className="form-control-placeholder"
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Есть ли команда:</Form.Label>
                                        {/* <label></label> */}
                                        <Form.Select
                                            style={{
                                                backgroundColor: "#333",
                                                color: "white",
                                                border: "1px solid #555",
                                            }}
                                            name="hasTeam"
                                            value={questionnaire.hasTeam ? 'Да' : 'Нет'}
                                            onChange={(e) => handleInputChange({ target: { name: 'hasTeam', value: e.target.value === 'Да' } })}
                                            disabled={!isEditable}
                                        >
                                            <option>Да</option>
                                            <option>Нет</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        {questionnaire.hasTeam && (
                                            <>
                                                <Form.Label>Команда:</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    style={{
                                                        backgroundColor: "#333",
                                                        color: "white",
                                                        border: "1px solid #555",
                                                    }}
                                                    name="team"
                                                    id="team"
                                                    value={questionnaire.team || ''}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditable}
                                                />
                                            </>
                                        )}

                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Есть ли образование:</Form.Label>
                                        {/* <label></label> */}
                                        <Form.Select
                                            name="hasEdu"
                                            style={{
                                                backgroundColor: "#333",
                                                color: "white",
                                                border: "1px solid #555",
                                            }}
                                            value={questionnaire.hasEdu ? 'Да' : 'Нет'}
                                            onChange={(e) => handleInputChange({ target: { name: 'hasEdu', value: e.target.value === 'Да' } })}
                                            disabled={!isEditable}
                                        >
                                            <option>Да</option>
                                            <option>Нет</option>
                                        </Form.Select>
                                    </Form.Group>



                                    <Form.Group className="mb-3">
                                        {questionnaire.hasEdu && (
                                            <>
                                                <Form.Label>Учебное заведение</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="eduEst"
                                                    id="eduEst"
                                                    value={questionnaire.eduEst || ''}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditable}
                                                    style={{
                                                        backgroundColor: "#333",
                                                        color: "white",
                                                        border: "1px solid #555",
                                                    }}
                                                    className="mb-3"
                                                />

                                                <Form.Label>Дата начала обучения</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="eduDateStart"
                                                    id="eduDateStart"
                                                    value={questionnaire.eduDateStart || ''}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditable}
                                                    style={{
                                                        backgroundColor: "#333",
                                                        color: "white",
                                                        border: "1px solid #555",
                                                    }}
                                                    className="mb-3"

                                                />

                                                <Form.Label htmlFor="eduDateEnd">Дата окончания обучения</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="eduDateEnd"
                                                    id="eduDateEnd"
                                                    value={questionnaire.eduDateEnd || ''}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditable}
                                                    style={{
                                                        backgroundColor: "#333",
                                                        color: "white",
                                                        border: "1px solid #555",
                                                    }}
                                                    className="mb-3"
                                                />
                                            </>
                                        )}
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Опыт работы</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="workExp"
                                            id="workExp"
                                            value={questionnaire.workExp || ''}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                            style={{
                                                backgroundColor: "#333",
                                                color: "white",
                                                border: "1px solid #555",
                                            }}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Дополнительная информация</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="selfInfo"
                                            id="selfInfo"
                                            value={questionnaire.selfInfo || ''}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                            style={{
                                                backgroundColor: "#333",
                                                color: "white",
                                                border: "1px solid #555",
                                            }}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Расценки</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="prices"
                                            id="prices"
                                            value={questionnaire.prices || ''}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                            style={{
                                                backgroundColor: "#333",
                                                color: "white",
                                                border: "1px solid #555",
                                            }}
                                        />
                                    </Form.Group>
                                </Form>
                                <Row>
                                    <Col>
                                        <Row>
                                            <Col>
                                                <h5 className="mt-4" style={{ color: "#ff7f00" }}>
                                                    Прикрепленные фотографии:
                                                </h5>

                                                {images.length > 0 ? (
                                                    <Row className="g-3">
                                                        {questionnaire.questionnaireImages.map((imagePath, index) => (
                                                            <Col key={index} xs={6} md={4} lg={3} style={{ position: "relative" }}>
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
                                                    <p>Фотографии отсутствуют</p>
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
                                                            backgroundColor: "#333",
                                                            color: "white",
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
                                                            <Button
                                                                variant="success"
                                                                onClick={handleUploadImages}
                                                                className="me-2"
                                                            >
                                                                Сохранить
                                                            </Button>
                                                            <Button variant="danger" onClick={handleCancelUpload}>
                                                                Отменить
                                                            </Button>
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

                                        {location.state?.fromLk === null ? null : (
                                            <div>
                                                {!isEditable && canEditOrDelete ? (
                                                    <>
                                                        <h5 className="text-center mb-2" style={{ color: "#ff7f00" }}>Данные по лицу</h5>

                                                        {/* <h3>Данные по лицу</h3> */}
                                                        {!entityId ?
                                                            (
                                                                <div>
                                                                    <div className="mb-4" >Выберите лицо, которое хотите привязать</div>
                                                                    <EntityCard onSelectEntity={handleSelectEntity} />
                                                                    <Button className='mt-2'
                                                                        style={{
                                                                            width: '100%',
                                                                            backgroundColor: "#ffb300",
                                                                            border: "none",
                                                                            color: "black",
                                                                            fontWeight: "bold",
                                                                            padding: "10px",
                                                                            borderRadius: "8px",
                                                                            transition: "background-color 0.3s",
                                                                        }}
                                                                        onClick={() => handleEventEntity("link")}>Привязать лицо</Button>


                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {entityData ? (
                                                                        isLegalEntity ? (
                                                                            <div>
                                                                                <h5 style={{ textAlign: 'center', color: 'white' }}>Ваше юридическое лицо</h5>
                                                                                <div
                                                                                    style={{
                                                                                        padding: '10px',
                                                                                        margin: '5px 0',
                                                                                        backgroundColor: 'grey',
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
                                                                                <h5 style={{ textAlign: 'center', color: 'white' }}>Ваше физическое лицо</h5>
                                                                                <div
                                                                                    style={{
                                                                                        padding: '10px',
                                                                                        margin: '5px 0',
                                                                                        backgroundColor: 'grey',
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
                                                                    <div style={{ width: "100%", boxSizing: "border-box", marginTop: "3px" }}>
                                                                        {/* Кнопка "Отвязать лицо" */}
                                                                        <Button
                                                                            style={{
                                                                                width: "100%", // Занимает всю ширину контейнера
                                                                                backgroundColor: "#ffb300",
                                                                                border: "none",
                                                                                color: "black",
                                                                                fontWeight: "bold",
                                                                                padding: "10px",
                                                                                borderRadius: "8px",
                                                                                transition: "background-color 0.3s",
                                                                                marginTop: "10px",
                                                                                fontSize: "16px", // Размер текста для лучшей видимости
                                                                                cursor: "pointer",
                                                                                boxSizing: "border-box", // Учитывает padding и border в ширину
                                                                            }}
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
                                                                onClick={handleEditClick}
                                                                style={styles.editButton}
                                                            >
                                                                Редактировать
                                                            </Button>

                                                            <Button
                                                                onClick={handleDeleteClick}
                                                                style={styles.deleteButton}
                                                            >
                                                                Удалить
                                                            </Button>
                                                        </ButtonGroup>
                                                    </>
                                                ) : isEditable ? (
                                                    <ButtonGroup style={styles.buttonContainer}>
                                                        <Button
                                                            onClick={handleSaveClick}
                                                            style={styles.editButton}
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

                                        <ReactionWindow
                                            isOpen={isModalOpen}
                                            onClose={closeModal}
                                            userId={questionnaire.userId}
                                            id={questionnaire.id}
                                            mode={1}
                                            receiverItemName={questionnaire.workCategories}
                                        />
                                        <style>
                                            {`
                .form-control-placeholder::placeholder {
                  color: #bbb;
                }
              `}
                                        </style>


                                    </Col >
                                </Row >
                            </Card.Body>
                        </Card>
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
        marginTop: '50px', // Отступ сверху
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

};

export default QuestionnaireDetails;
