import React, { useState, useEffect } from 'react';
import ImageLoader from './ImageLoader'
import EntityModal from './AddEntityWindow'
import { useProfile } from '../../Context/ProfileContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, ListGroup } from "react-bootstrap";
import EntityDetailsModal from '../../Previews/EntityDetails';
import ToastNotification from '../../Notification/ToastNotification';
import { useToast } from '../../Notification/ToastContext';
import AvatarUploader from '../../Previews/AvatarUploader'
const ImageUploader = ({ label, onUpload, imagePath, onTrigger }) => {

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            await onUpload(file);
        }
    };

    return (
        <div>
            <label>{label}</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>
    );
};

const FormField = ({ type, label, name, placeholder, value, onChange, disabled }) => {
    return (
        <div>
            <label>{label}</label>
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
            />
        </div>
    );
};

const Entities = ({ onSelectEntity, triggerGet, onTrigger, onGotPerson }) => {
    const url = localStorage.getItem("url");
    const authToken = localStorage.getItem("authToken");
    const { isSpecialist } = useProfile();

    const [isEntityDetailsModalOpen, setIsEntityDetailsModalOpen] = useState(false);
    const openEntityDetailsModal = () => setIsEntityDetailsModalOpen(true);
    const closeEntityDetailsModal = () => {
        setIsEntityDetailsModalOpen(false); // Закрываем модальное окно
        setSelectedEntity(null); // Сбрасываем выбранный ID
    };
    const [legalEntities, setLegalEntities] = useState([]);
    const [persons, setPersons] = useState([]);
    const [selectedEntity, setSelectedEntity] = useState(null); // ID выбранного лица

    const navigate = useNavigate();

    useEffect(() => {
        if (selectedEntity) {
            // navigate(`/entity/${selectedEntity}`);

        }
    }, [selectedEntity, navigate]);

    useEffect(() => {
        const fetchDataLegal = async () => {
            try {
                const response = await fetch(`${url}/${isSpecialist ? "contractor" : "customer"}/legal-entity`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status}`);
                }

                const data = await response.json();
                setLegalEntities(data);
            } catch (error) {
                // console.error("Ошибка при загрузке юрлиц:", error.message);
                showToast("Ошибка при загрузке юрлиц", "danger")
            }
        };

        const fetchDataPerson = async () => {
            try {
                const response = await fetch(`${url}/${isSpecialist ? "contractor" : "customer"}/person`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status}`);
                }

                const data = await response.json();
                setPersons(data);

                data.length === 0 ? onGotPerson(false) : onGotPerson(true)

            } catch (error) {
                // console.error("Ошибка при загрузке физлиц:", error.message);
                showToast("Ошибка при загрузке физлиц", "danger")
            }
        };

        fetchDataLegal();
        fetchDataPerson();
    }, [isSpecialist, url, authToken, triggerGet]);

    const handleSelectEntity = (id) => {
        setSelectedEntity(id); // Установка выбранного ID
        openEntityDetailsModal(); // Открытие модального окна
    };

    return (
        <Container>
            <Row className="g-4">
                {/* Левый столбец - Юридические лица */}
                <Col md={6}>
                    <Card className="shadow-lg">
                        <Card.Body>
                            <h4 className="text-center text-primary mb-4">Юридические лица</h4>
                            <ListGroup>
                                {legalEntities.length > 0 ? (
                                    legalEntities.map((entity) => (
                                        <ListGroup.Item
                                            key={entity.id}
                                            onClick={() => handleSelectEntity(entity.id)}
                                            className={`d-flex flex-column 
                                                ${selectedEntity === entity.id ? "bg-success text-white" : "bg-light"}`}
                                            style={{
                                                cursor: "pointer",
                                                borderRadius: "8px",
                                                padding: "12px",
                                                marginBottom: "10px",
                                            }}
                                        >
                                            <div className="fw-bold">{entity.firm}</div>
                                            <div className="text-muted fw-bold">ИНН: {entity.inn}</div>
                                        </ListGroup.Item>
                                    ))
                                ) : (
                                    <p className="text-center text-muted mt-3">Нет зарегистрированных юридических лиц</p>
                                )}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Правый столбец - Физические лица */}
                <Col md={6}>
                    <Card className="shadow-lg">
                        <Card.Body>
                            <h4 className="text-center text-primary mb-4">Физические лица</h4>
                            <ListGroup>
                                {persons.length > 0 ? (
                                    persons.map((person) => (
                                        <ListGroup.Item
                                            key={person.id}
                                            onClick={() => handleSelectEntity(person.id)}
                                            className={`d-flex flex-column 
                                                ${selectedEntity === person.id ? "bg-success text-white" : "bg-light"}`}
                                            style={{
                                                cursor: "pointer",
                                                borderRadius: "8px",
                                                padding: "12px",
                                                marginBottom: "10px",
                                            }}
                                        >
                                            <div className="fw-bold">{person.fullName}</div>
                                            <div className="text-muted fw-bold">ИНН: {person.inn}</div>
                                        </ListGroup.Item>
                                    ))
                                ) : (
                                    <p className="text-center text-muted mt-3">Нет зарегистрированных физических лиц</p>
                                )}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <EntityDetailsModal
                id={selectedEntity}
                isOpen={isEntityDetailsModalOpen}
                onClose={closeEntityDetailsModal}
                onTrigger={() => onTrigger()}
            />

        </Container>
    );
};

const ProfilePage = () => {

    const showToast = useToast();

    const [profileData, setProfileData] = useState({
        surname: '',
        patronymic: '',
        name: '',
        birthday: '',
        email: '',
        phoneNumber: '',
    });
    const [avatarPath, setAvatarPath] = useState(null);
    const [passportPhoto1, setPassportPhoto1] = useState(null);
    const [passportPhoto2, setPassportPhoto2] = useState(null);
    const [passportPhoto3, setPassportPhoto3] = useState(null);
    const [isEditable, setIsEditable] = useState(false);
    const [error, setError] = useState(null);
    const url = localStorage.getItem('url');
    const authToken = localStorage.getItem('authToken');
    const { isSpecialist } = useProfile();

    const [fullName, setFullName] = useState("");
    // Работа с модальным окном
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const [legal, setLegal] = useState({});
    const [person, setPerson] = useState({});

    const [triggerGet, setTriggerGet] = useState(false);



    const toggleTriggerGet = () => {
        setTriggerGet((prev) => !prev);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${url}/profile`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status}`);
                }

                const data = await response.json();
                if (data.profile) {
                    setProfileData(data.profile);
                    setFullName(data.profile.surname + ' ' + data.profile.name[0] + '.' + data.profile.patronymic[0] + '.')
                    // console.log(fullName)
                    setAvatarPath(data.profile.avatar || null);
                    const passportPath = data.profile.passport || [];
                    setPassportPhoto1(passportPath[0] || null);
                    setPassportPhoto2(passportPath[1] || null);
                    setPassportPhoto3(passportPath[2] || null);
                    setIsEditable(false);
                } else {
                    setIsEditable(true); // Если данных нет, сразу включаем режим редактирования
                }
            } catch (error) {
                setError(`Ошибка при загрузке данных профиля: ${error.message}`);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchDataLegal = async () => {
            try {
                const response = await fetch(`${url}/${isSpecialist ? 'contractor' : 'customer'}/legal-entity`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status}`);
                }

                const data = await response.json();
                // console.log('Ю', data)
                setLegal(data);
            } catch (error) {
                setError(`Ошибка при загрузке данных профиля: ${error.message}`);
            }
        };

        const fetchDataPerson = async () => {
            try {
                const response = await fetch(`${url}/${isSpecialist ? 'contractor' : 'customer'}/person`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status}`);
                }

                const data = await response.json();
                // console.log('Ф', data)
                setPerson(data)
            } catch (error) {
                setError(`Ошибка при загрузке данных профиля: ${error.message}`);
            }
        };

        fetchDataLegal();
        fetchDataPerson();
    }, [triggerGet]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSelectEntity = (e) => {

    };

    const handleSave = async () => {
        try {
            const response = await fetch(`${url}/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(profileData),
            });
            // console.log(response)
            if (!response.ok) {
                throw new Error(`Ошибка сети: ${response.status}`);
            } else {
                showToast('Данные профиля успешно сохранены', 'success')
                setIsEditable(false);
            }
        } catch (error) {
            showToast('Данные профиля не сохранены!', 'danger')
        }
    };

    const handleAvatarUpload = async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`${url}/profile/avatar`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Ошибка загрузки аватара: ${response.status}`);
            }

            const data = await response.json();
            setAvatarPath(data.avatar);
            setTriggerGet(!triggerGet)

            // alert('Аватар успешно загружен!');
        } catch (error) {
            setError(`Ошибка загрузки аватара: ${error.message}`);
        }
    };

    const handlePassportUpload = async (file, index) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('page', index + 1);
        try {
            const response = await fetch(`${url}/profile/passport`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Ошибка загрузки паспорта ${index + 1}: ${response.status}`);
            }

            const data = await response.json();
            // alert(`Фото паспорта ${index + 1} успешно загружено!`);
            showToast(`Фото паспорта ${index + 1} успешно загружено!`, 'success')

            // Обновляем соответствующую фотографию
            if (index === 0) setPassportPhoto1(data.passport);
            if (index === 1) setPassportPhoto2(data.passport);
            if (index === 2) setPassportPhoto3(data.passport);
        } catch (error) {
            setError(`Ошибка загрузки паспорта ${index + 1}: ${error.message}`);
        }
    };

    const [gotPerson, setGotPerson] = useState()

    const handleGotPerson = (gotPerson) => {
        // console.log("Got person:", gotPerson);
        setGotPerson(gotPerson)
    };

    return (
        <Container fluid className="py-4" style={{ backgroundColor: "#242582", minHeight: "100vh" }}>
            <Row className="justify-content-center">

                {/* Личные данные */}
                <Col xs={12} lg={10} className="mb-4">
                    <Card className="p-4 shadow-lg">
                        <Card.Body>
                            <h2 className="text-center mb-4 text-primary">Ваши данные</h2>
                            {error && <p className="text-danger text-center">{error}</p>}
                            <Form>
                                {/* Номер телефона */}
                                <Form.Group controlId="formPhoneNumber" className="mb-3">
                                    <Form.Label className="fw-bold">Номер телефона</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={localStorage.getItem("phoneNumber")}
                                        disabled
                                        className="rounded-pill p-3 text-center"
                                        style={{ backgroundColor: "#e9ecef", border: "none" }}
                                    />
                                </Form.Group>

                                <Form.Group controlId="formSurname" className="mb-3">
                                    <Form.Label className="fw-bold">Фамилия</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="surname"
                                        placeholder="Введите вашу фамилию"
                                        value={profileData.surname || ""}
                                        onChange={(e) => {
                                            const onlyLetters = e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ\s-]/g, "");
                                            handleInputChange({ target: { name: e.target.name, value: onlyLetters } });
                                        }}
                                        disabled={!isEditable}
                                        className="rounded-pill p-3"
                                    />
                                </Form.Group>

                                {/* Имя */}
                                <Form.Group controlId="formName" className="mb-3">
                                    <Form.Label className="fw-bold">Имя</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        placeholder="Введите ваше имя"
                                        value={profileData.name || ""}
                                        onChange={(e) => {
                                            const onlyLetters = e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ\s-]/g, "");
                                            handleInputChange({ target: { name: e.target.name, value: onlyLetters } });
                                        }}
                                        disabled={!isEditable}
                                        className="rounded-pill p-3"
                                    />
                                </Form.Group>




                                {/* Отчество */}
                                <Form.Group controlId="formPatronymic" className="mb-3">
                                    <Form.Label className="fw-bold">Отчество</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="patronymic"
                                        placeholder="Введите ваше отчество"
                                        value={profileData.patronymic || ""}
                                        onChange={(e) => {
                                            const onlyLetters = e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ\s-]/g, "");
                                            handleInputChange({ target: { name: e.target.name, value: onlyLetters } });
                                        }}
                                        disabled={!isEditable}
                                        className="rounded-pill p-3"
                                    />
                                </Form.Group>

                                {/* Фамилия */}


                                {/* Почта */}
                                <Form.Group controlId="formEmail" className="mb-3">
                                    <Form.Label className="fw-bold">Почта</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        placeholder="Введите вашу почту"
                                        value={profileData.email || ""}
                                        onChange={handleInputChange}
                                        disabled={!isEditable}
                                        className="rounded-pill p-3"
                                    />
                                </Form.Group>

                                {/* Дата рождения */}
                                <Form.Group controlId="formBirthday" className="mb-4">
                                    <Form.Label className="fw-bold">Дата рождения</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="birthday"
                                        value={profileData.birthday || ""}
                                        onChange={handleInputChange}
                                        disabled={!isEditable}
                                        className="rounded-pill p-3"
                                    />
                                </Form.Group>

                                {/* Кнопки */}
                                <div className="d-grid gap-2">
                                    {isEditable ? (
                                        <div className="d-flex gap-2">
                                            <Button
                                                variant="danger"
                                                className="w-50"
                                                style={{ fontSize: "18px" }}
                                                onClick={() => setIsEditable(false)}
                                            >
                                                Отмена
                                            </Button>
                                            <Button
                                                variant="success"
                                                className="w-50"
                                                style={{ fontSize: "18px" }}
                                                onClick={handleSave}
                                            >
                                                Сохранить
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="primary"
                                            className=" w-100"
                                            style={{ fontSize: "18px" }}
                                            onClick={() => setIsEditable(true)}
                                        >
                                            Редактировать
                                        </Button>
                                    )}
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Данные по лицам */}
                <Col xs={12} lg={10} className="mb-4">
                    <Card className="p-4 shadow-lg">
                        <Card.Body>
                            <h2 className="text-center mb-4 text-primary">Данные по лицам</h2>

                            {/* handleShowToast('Данные профиля не сохранены!', 'error') */}
                            <Entities onSelectEntity={handleSelectEntity} triggerGet={triggerGet} onTrigger={() => toggleTriggerGet()} onGotPerson={handleGotPerson} />

                            <div className="d-grid mt-3">
                                <Button variant="primary" onClick={openModal} className="w-100">
                                    Добавить новое лицо
                                </Button>
                            </div>
                            <EntityModal isOpen={isModalOpen} onClose={closeModal} fullName={fullName} onTrigger={() => toggleTriggerGet()} gotPerson={gotPerson} />
                        </Card.Body>
                    </Card>
                </Col>

                {/* Фото профиля */}
                <Col xs={12} lg={10}>
                    <Card className="p-4 shadow-lg">
                        <Card.Body>
                            <div className="d-flex flex-column align-items-center">
                                <ImageLoader
                                    imagePath={avatarPath}
                                    place={"profile"}
                                    onTrigger={triggerGet} // Передаем triggerGet
                                />
                                <div className="mt-3">
                                    <Button variant="primary" onClick={() => document.getElementById("avatarUpload").click()}>
                                        Загрузить аватар
                                    </Button>
                                </div>
                                <input
                                    id="avatarUpload"
                                    type="file"
                                    accept="image/*"
                                    className="d-none"
                                    onChange={(e) => handleAvatarUpload(e.target.files[0])}
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ProfilePage;
