import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Card, Container, Row, Col } from "react-bootstrap";
import { useProfile } from "../../Components/Context/ProfileContext";
import TopBar from "../Pages/TopBar/TopBar";
const EntityDetails = () => {
    const [isLegalEntity, setIsLegalEntity] = useState(null);
    const [entityData, setEntityData] = useState({});
    const [originalData, setOriginalData] = useState({});
    const [isEditable, setIsEditable] = useState(false);

    const url = localStorage.getItem("url");
    const getAuthToken = () => localStorage.getItem("authToken");
    const { isSpecialist } = useProfile();
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const entityParams = new URLSearchParams();
                const who = isSpecialist ? "contractor" : "customer";
                isSpecialist
                    ? entityParams.append("contractorId", id)
                    : entityParams.append("customerId", id);

                const entityResponse = await fetch(
                    `${url}/${who}?${entityParams.toString()}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${getAuthToken()}`,
                        },
                    }
                );

                if (!entityResponse.ok) {
                    throw new Error(
                        `Ошибка при получении данных лица: ${entityResponse.status}`
                    );
                }

                const entityData = await entityResponse.json();
                setIsLegalEntity(entityData.isLegalEntity);
                setEntityData(entityData);
                setOriginalData(entityData); // Сохраняем исходные данные
            } catch (error) {
                console.error(`Ошибка при выполнении запросов: ${error.message}`);
            }
        };

        fetchData();
    }, [id, url, isSpecialist]);

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
        setEntityData(originalData); // Восстанавливаем исходные данные
        setIsEditable(false);
    };

    const handleDeleteClick = async () => {
        try {
            const entityParams = new URLSearchParams();
            const who = isSpecialist ? "contractor" : "customer";
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

            navigate(`/account-actions`);
        } catch (error) {
            console.error(`Ошибка при удалении данных: ${error.message}`);
        }
    };

    const handleSaveClick = async () => {
        try {
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

            setOriginalData(entityData); // Обновляем исходные данные
            setIsEditable(false); // Отключаем режим редактирования
        } catch (error) {
            console.error(`Ошибка при сохранении данных: ${error.message}`);
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
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <TopBar />
            <Container
                fluid
                className="py-5"
                style={{
                    backgroundColor: "#242582",
                    flex: 1
                }}
            >
                <Row>
                    <Col xs={12} md={8} lg={6} className="mx-auto">
                        <Card className="p-4 shadow-lg">
                            <Card.Body>
                                <h3 className="text-center mb-4">
                                    {isLegalEntity ? "Юридическое лицо" : "Физическое лицо"}
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
                                            type="text"
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
                                            type="text"
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
                                            type="text"
                                            name="corrAcc"
                                            value={entityData.corrAcc || ""}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Расчетный счет</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="currAcc"
                                            value={entityData.currAcc || ""}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>БИК</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="bik"
                                            value={entityData.bik || ""}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                        />
                                    </Form.Group>


                                </Form>

                                <div className="d-flex justify-content-center gap-3 mt-4">
                                    {!isEditable ? (
                                        <Button
                                            variant="primary"
                                            className="rounded-pill px-4 py-2"
                                            style={{ fontSize: "16px" }}
                                            onClick={handleEditClick}
                                        >
                                            Редактировать
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                variant="success"
                                                className="rounded-pill px-4 py-2"
                                                style={{ fontSize: "16px" }}
                                                onClick={handleSaveClick}
                                            >
                                                Сохранить
                                            </Button>
                                            <Button
                                                variant="warning"
                                                className="rounded-pill px-4 py-2 text-white"
                                                style={{
                                                    fontSize: "16px",
                                                    backgroundColor: "#ff7101",
                                                    border: "none",
                                                }}
                                                onClick={handleCancelClick}
                                            >
                                                Отмена
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        variant="danger"
                                        className="rounded-pill px-4 py-2"
                                        style={{ fontSize: "16px" }}
                                        onClick={handleDeleteClick}
                                    >
                                        Удалить
                                    </Button>
                                </div>


                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div >

    );
};

export default EntityDetails;
