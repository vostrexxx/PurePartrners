import React from "react";
import { useNavigate } from "react-router-dom";
import NotAuthTopBar from "../TopBar/NotAuthTopBar";
import { useProfile } from "../../Context/ProfileContext";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
const NonAuthMinPage = () => {
    const navigate = useNavigate();
    const { isSpecialist } = useProfile();

    const handleIdentification = () => {
        navigate("/identification");
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <NotAuthTopBar />
            <Container
                fluid
                className="py-5"
                style={{
                    backgroundColor: "#242582",
                    flex: 1
                }}
            >
                <Row className="justify-content-center">
                    <Col xs={12} md={8} lg={6}>
                        <Card className="shadow-lg">
                            <Card.Body>
                                {isSpecialist ? (
                                    <div>
                                        <h1 className="text-primary text-center">Специалист</h1>
                                        <p className="text-muted fs-5 text-center">
                                            Тут должна быть информация по Специалисту, что сервис может предоставить специалистам.
                                        </p>
                                        <p
                                            className="text-truncate text-center"
                                            style={{ maxWidth: "300px", margin: "0 auto" }}
                                        >
                                            Длинный текст, который будет обрезан многоточием, если он превышает ширину.
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <h1 className="text-primary text-center">Заказчик</h1>
                                        <p className="text-muted fs-5 text-center">
                                            Тут должна быть информация по Заказчику, что сервис может предоставить заказчикам.
                                        </p>
                                        <p
                                            className="text-truncate text-center"
                                            style={{ maxWidth: "300px", margin: "0 auto" }}
                                        >
                                            Длинный текст, который будет обрезан многоточием, если он превышает ширину.
                                        </p>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

        </div>
    );
};

export default NonAuthMinPage;
