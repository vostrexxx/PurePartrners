import  {useEffect, useState} from 'react';
import {useParams, useLocation, useNavigate} from 'react-router-dom';
import ReactionWindow from '../Agreement/Reaction';
import TopBar from '../../TopBars/TopBar';
import EntityCard from '../../Previews/EntityCard'
import {useToast} from '../../Notification/ToastContext'
import {Button, Card, Container, Form, Row, Col, Image, Modal, ButtonGroup} from "react-bootstrap";
import TextField from "@mui/material/TextField";
import {FaArrowLeft} from 'react-icons/fa';
import {
    Select,
    MenuItem,
} from "@mui/material";
import {Delete} from '@mui/icons-material';

const QuestionnaireDetails = () => {
    const showToast = useToast();

    const {id} = useParams();
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
                const params = new URLSearchParams({questionnaireId: id});
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
                            const entityParams = new URLSearchParams({contractorId: id});
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
                        const params = new URLSearchParams({imagePath});
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

        try {
            const params = new URLSearchParams({filePath});
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
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
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
        try {
            const params = new URLSearchParams({questionnaireId: id});

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
                    body: JSON.stringify({questionnaireId: id, mode: "link", entityId: selectedEntityId}),
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
                const response = await fetch(`${url}/questionnaire/entity`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                    body: JSON.stringify({questionnaireId: id, mode: "unlink"}),
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
                                // backgroundColor: "#091E34",
                                // color: "white",
                                borderRadius: "12px",
                                padding: "10px",
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
                                    Детали анкеты
                                </h2>

                                <hr className=''
                                    style={{
                                        height: '2px',
                                        background: "white",
                                        // margin: margin,
                                    }}
                                />

                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Категории работ</Form.Label>
                                        <TextField
                                            type="text"

                                            name="workCategories"
                                            id="workCategories"
                                            value={questionnaire.workCategories || ''}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                            // style={styles.input}
                                            className="w-100"
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

                                    <Form.Group className="mb-3">
                                        <Form.Label>Имеется ли команда?</Form.Label>
                                        {/* <label></label> */}
                                        <Select
                                            labelId="hasTeam-label"
                                            id="hasTeam"
                                            name="hasTeam"
                                            value={questionnaire.hasTeam ? "Да" : "Нет"}
                                            onChange={(e) =>
                                                handleInputChange({
                                                    target: {name: "hasTeam", value: e.target.value === "Да"},
                                                })
                                            }
                                            className='w-100'
                                            disabled={!isEditable}
                                            sx={{
                                                // Стили для обычного состояния
                                                '& .MuiSelect-select': {
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
                                                '& .MuiSelect-icon': {
                                                    display: isEditable ? 'inline-block' : 'none', // Скрываем стрелочку, если disabled
                                                },

                                                // Стили для disabled состояния
                                                '&.Mui-disabled': {
                                                    '& .MuiSelect-select': {
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

                                        >
                                            <MenuItem value="Да">Да</MenuItem>
                                            <MenuItem value="Нет">Нет</MenuItem>
                                        </Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        {questionnaire.hasTeam && (
                                            <>
                                                <Form.Label>Описание команды</Form.Label>
                                                <TextField
                                                    type="text"
                                                    multiline
                                                    minRows={1}
                                                    maxRows={4}
                                                    name="team"
                                                    id="team"
                                                    value={questionnaire.team || ""}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditable}
                                                    className='w-100'
                                                    // placeholder="Незаполенено"
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
                                            </>
                                        )}

                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Имеется ли профильное образование?</Form.Label>
                                        {/* <label></label> */}
                                        <Select
                                            labelId="hasEdu-label"
                                            id="hasEdu"
                                            name="hasEdu"
                                            value={questionnaire.hasEdu ? "Да" : "Нет"}
                                            onChange={(e) =>
                                                handleInputChange({
                                                    target: {name: "hasEdu", value: e.target.value === "Да"},
                                                })
                                            }
                                            disabled={!isEditable}
                                            className='w-100'
                                            sx={{
                                                // Стили для обычного состояния
                                                '& .MuiSelect-select': {
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
                                                '& .MuiSelect-icon': {
                                                    display: isEditable ? 'inline-block' : 'none', // Скрываем стрелочку, если disabled
                                                },

                                                // Стили для disabled состояния
                                                '&.Mui-disabled': {
                                                    '& .MuiSelect-select': {
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
                                        >
                                            <MenuItem value="Да">Да</MenuItem>
                                            <MenuItem value="Нет">Нет</MenuItem>
                                        </Select>
                                    </Form.Group>


                                    <Form.Group>
                                        {questionnaire.hasEdu && (
                                            <>
                                                <Form.Label>Учебное заведение</Form.Label>
                                                <TextField
                                                    type="text"
                                                    name="eduEst"
                                                    id="eduEst"
                                                    value={questionnaire.eduEst || ''}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditable}
                                                    // className=''
                                                    className="mb-3 w-100"
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

                                                <Form.Label>Дата начала обучения</Form.Label>
                                                <TextField
                                                    type="date"
                                                    name="eduDateStart"
                                                    id="eduDateStart"
                                                    value={questionnaire.eduDateStart || ''}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditable}
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
                                                    className="mb-3 w-100"

                                                />

                                                <Form.Label htmlFor="eduDateEnd">Дата окончания обучения</Form.Label>
                                                <TextField
                                                    type="date"
                                                    name="eduDateEnd"
                                                    id="eduDateEnd"
                                                    value={questionnaire.eduDateEnd || ''}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditable}
                                                    className="mb-3 w-100"
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
                                            </>
                                        )}
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Опыт работы</Form.Label>
                                        <TextField
                                            type="number"
                                            name="workExp"
                                            id="workExp"
                                            value={questionnaire.workExp || ''}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                            className='w-100'
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

                                    <Form.Group className="mb-3">
                                        <Form.Label>Дополнительная информация</Form.Label>
                                        <TextField
                                            type="text"
                                            name="selfInfo"
                                            id="selfInfo"
                                            value={questionnaire.selfInfo || ''}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                            multiline
                                            minRows={1}
                                            maxRows={4}
                                            className='w-100'
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

                                    <Form.Group className="mb-3">
                                        <Form.Label>Расценки</Form.Label>
                                        <TextField
                                            type="text"
                                            name="prices"
                                            id="prices"
                                            value={questionnaire.prices || ''}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
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
                                        <Row>
                                            <Col>
                                                <h5 className="mt-2 mb-4 text-center" style={{color: "#ff7f00"}}>
                                                    Прикрепленные фотографии
                                                </h5>

                                                {images.length > 0 ? (
                                                    <Row className="g-3">
                                                        {questionnaire.questionnaireImages.map((imagePath, index) => (
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
                                                    <div className='text-center'>Фотографии отсутствуют</div>
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
                                                                    variant="danger"
                                                                    onClick={handleCancelUpload}
                                                                    className="w-50"
                                                                    style={{fontSize: "18px"}}

                                                                >
                                                                    Отменить
                                                                </Button>
                                                                <Button
                                                                    variant="success"
                                                                    onClick={handleUploadImages}
                                                                    className="w-50"
                                                                    style={{fontSize: "18px"}}

                                                                >
                                                                    Сохранить
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

                                        {location.state?.fromLk === null ? null : (
                                            <div className='mt-4'>
                                                {!isEditable && canEditOrDelete ? (
                                                    <>
                                                        <h5 className="text-center mb-2"
                                                            style={{color: "#ff7f00"}}>Данные по лицу</h5>

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
                                                                        // style={{
                                                                        //     width: '100%',
                                                                        //     backgroundColor: "#ffb300",
                                                                        //     border: "none",
                                                                        //     color: "black",
                                                                        //     fontWeight: "bold",
                                                                        //     padding: "10px",
                                                                        //     borderRadius: "8px",
                                                                        //     transition: "background-color 0.3s",
                                                                        // }}
                                                                        variant='success'
                                                                        // className=''
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
                                                                                <h5 style={{textAlign: 'center',}}>Ваше
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
                                                                            className='w-100 mt-2'
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


                                    </Col>
                                </Row>
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
        marginTop: '20px', // Отступ сверху
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

export default QuestionnaireDetails;
