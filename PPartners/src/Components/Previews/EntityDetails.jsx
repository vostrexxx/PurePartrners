import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Card, Container, Row, Col } from "react-bootstrap";
import { useProfile } from "../../Components/Context/ProfileContext";
import { useToast } from '../../Components/Notification/ToastContext';

const EntityDetailsModal = ({ isOpen, onClose, id, onTrigger }) => {

    const showToast = useToast();

    const [isLegalEntity, setIsLegalEntity] = useState();
    const [entityData, setEntityData] = useState({});
    const [originalData, setOriginalData] = useState({});
    const [isEditable, setIsEditable] = useState(false);

    const [origData, setOrigData] = useState({});


    const url = localStorage.getItem("url");
    const getAuthToken = () => localStorage.getItem("authToken");
    const { isSpecialist } = useProfile();
    // const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && id) {
            // Логика загрузки данных по ID
            const fetchEntityDetails = async () => {
                try {
                    const url = localStorage.getItem("url");
                    const getAuthToken = () => localStorage.getItem("authToken");

                    const entityParams = new URLSearchParams();
                    const who = isSpecialist ? "contractor" : "customer";
                    isSpecialist
                        ? entityParams.append("contractorId", id)
                        : entityParams.append("customerId", id);

                    const response = await fetch(
                        `${url}/${who}?${entityParams.toString()}`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${getAuthToken()}`,
                            },
                        }
                    );

                    if (!response.ok) {
                        throw new Error(`Ошибка при получении данных лица: ${response.status}`);
                    }

                    const data = await response.json();
                    console.log(isLegalEntity)
                    setEntityData(data);
                    setIsLegalEntity(data.isLegalEntity);
                    setOrigData(data)
                    // console.log()

                } catch (error) {
                    console.error(`Ошибка при выполнении запросов: ${error.message}`);
                }
            };

            fetchEntityDetails();
        }
    }, [isOpen, id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEntityData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleEditClick = () => {
        setIsEditable(true);
    };

    const handleCancelClick = () => {
        setEntityData(origData);
        setIsEditable(false);
    };

    const handleDeleteClick = async () => {
        try {
            const who = isSpecialist ? "contractor" : "customer";

            if (isLegalEntity) {
                const entityParams = new URLSearchParams();
                isSpecialist
                    ? entityParams.append("contractorId", id)
                    : entityParams.append("customerId", id);
                const response = await fetch(`${url}/${who}?${entityParams.toString()}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Ошибка при удалении данных: ${response.status}`);
                }
            }
            else {
                const response1 = await fetch(`${url}/customer/person`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                });
                if (!response1.ok) {
                    throw new Error(`Ошибка при удалении данных: ${response1.status}`);
                }
                const response2 = await fetch(`${url}/contractor/person`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                });
                if (!response2.ok) {
                    throw new Error(`Ошибка при удалении данных: ${response2.status}`);
                }
            }

            showToast('Данные лица успешно удалены', 'success')

        } catch (error) {
            console.error(`Ошибка при удалении данных: ${error.message}`);
            showToast('Ошибка при удалении лица', 'danger')
        }
        onClose();
        onTrigger()
    };

    const handleSaveClick = async () => {
        try {
            if (!entityData.isLegalEntity) {
                let id = entityData.id
                entityData.id = null

                const who = isSpecialist ? "contractor" : "customer";

                if (who === "customer") {
                    const responseContractor = await fetch(`${url}/${"contractor"}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getAuthToken()}`,
                        },
                        body: JSON.stringify(entityData),
                    });
                    entityData.id = id
                    const responseCustomer = await fetch(`${url}/${"customer"}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getAuthToken()}`,
                        },
                        body: JSON.stringify(entityData),
                    });

                    if (!responseCustomer.ok) {
                        throw new Error(`Ошибка при сохранении данных: ${responseCustomer.status}`);
                    }

                    if (!responseContractor.ok) {
                        throw new Error(`Ошибка при сохранении данных: ${responseContractor.status}`);
                    }
                } else {
                    const responseContractor = await fetch(`${url}/${"customer"}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getAuthToken()}`,
                        },
                        body: JSON.stringify(entityData),
                    });
                    entityData.id = id
                    const responseCustomer = await fetch(`${url}/${"contractor"}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getAuthToken()}`,
                        },
                        body: JSON.stringify(entityData),
                    });

                    if (!responseCustomer.ok) {
                        throw new Error(`Ошибка при сохранении данных: ${responseCustomer.status}`);
                    }

                    if (!responseContractor.ok) {
                        throw new Error(`Ошибка при сохранении данных: ${responseContractor.status}`);
                    }

                }
            } else {
                const who = isSpecialist ? "contractor" : "customer";
                const response = await fetch(`${url}/${who}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${getAuthToken()}`,
                    },
                    body: JSON.stringify(entityData),
                });

                if (!response.ok) {
                    throw new Error(`Ошибка при сохранении данных: ${response.status}`);
                }
            }

            onTrigger()
            setOriginalData(entityData); // Обновляем исходные данные
            setIsEditable(false); // Отключаем режим редактирования
            showToast('Данные лица успешно сохранены', 'success')

        } catch (error) {
            console.error(`Ошибка при сохранении данных: ${error.message}`);
            showToast('Ошибка сохранения данных лица', 'error')

        }
    };

    if (!entityData) {
        return (
            <Container className="text-center mt-5">
                <p>Загрузка данных лица...</p>
            </Container>
        );
    }

    return (
        <Modal show={isOpen} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Детали лица</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div style={{ display: "flex", flexDirection: "column" }}>

                    <Row>
                        <Col xs={12} md={8} lg={6} className="mx-auto">

                            <h3 className="text-center mb-4">
                                {isLegalEntity && isLegalEntity ? "Юридическое лицо" : "Физическое лицо"}
                            </h3>
                            <Form>
                                {/* Общие поля */}
                                <Form.Group className="mb-3">
                                    <Form.Label>ФИО</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="fullName"
                                        value={entityData.fullName || ""}
                                        onChange={handleInputChange}
                                        disabled={!isEditable}
                                    />
                                </Form.Group>

                                {/* Поля для юридического лица */}
                                {isLegalEntity && (
                                    <>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Наименование фирмы</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="firm"
                                                value={entityData.firm || ""}
                                                onChange={handleInputChange}
                                                disabled={!isEditable}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                            <Form.Label>Должность</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="position"
                                                value={entityData.position || ""}
                                                onChange={handleInputChange}
                                                disabled={!isEditable}
                                            />
                                        </Form.Group>
                                    </>
                                )}

                                <Form.Group className="mb-3">
                                    <Form.Label>ИНН</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="inn"
                                        value={entityData.inn || ""}
                                        onChange={handleInputChange}
                                        disabled={!isEditable}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Адрес</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="address"
                                        value={entityData.address || ""}
                                        onChange={handleInputChange}
                                        disabled={!isEditable}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>КПП</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="kpp"
                                        value={entityData.kpp || ""}
                                        onChange={handleInputChange}
                                        disabled={!isEditable}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Банк</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="bank"
                                        value={entityData.bank || ""}
                                        onChange={handleInputChange}
                                        disabled={!isEditable}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Корреспондентский счет</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="corrAcc"
                                        value={entityData.corrAcc || ""}
                                        onChange={handleInputChange}
                                        disabled={!isEditable}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Расчетный счет</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="currAcc"
                                        value={entityData.currAcc || ""}
                                        onChange={handleInputChange}
                                        disabled={!isEditable}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>БИК</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="bik"
                                        value={entityData.bik || ""}
                                        onChange={handleInputChange}
                                        disabled={!isEditable}
                                    />
                                </Form.Group>


                            </Form>

                        </Col>
                    </Row>
                </div >
            </Modal.Body>
            <Modal.Footer>
                {/* <Button variant="secondary" onClick={onClose}>
                    Закрыть
                </Button> */}
                <div className="d-flex gap-2 w-100">

                    {!isEditable ? (
                        <>
                            <Button
                                variant="danger"
                                className="flex-grow-1"
                                style={{ fontSize: "15px" }}
                                onClick={handleDeleteClick}
                            >
                                Удалить
                            </Button>
                            <Button
                                variant="success"
                                className="flex-grow-1"
                                style={{ fontSize: "15px" }}
                                onClick={handleEditClick}
                            >
                                Редактировать
                            </Button>

                        </>

                    ) : (
                        <>

                            <Button
                                variant="danger"
                                className="flex-grow-1"
                                // style={{
                                //     fontSize: "15px",
                                //     backgroundColor: "#ff7101",
                                //     border: "none",
                                // }}
                                onClick={handleCancelClick}
                            >
                                Отмена
                            </Button>

                            <Button
                                variant="success"
                                className="flex-grow-1"
                                style={{ fontSize: "15px" }}
                                onClick={handleSaveClick}
                            >
                                Сохранить
                            </Button>
                        </>
                    )}

                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default EntityDetailsModal;
