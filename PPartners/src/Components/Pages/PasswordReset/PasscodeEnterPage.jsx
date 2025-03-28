import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Row, Col, Form, Card } from "react-bootstrap";
import NotAuthTopBar from "../TopBar/NotAuthTopBar";
import InputMask from "react-input-mask"; // Импортируем библиотеку для маски

const CodeEnteringPage = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState("");
    const [phoneNumber] = useState(localStorage.getItem("phoneNumber") || "");
    const [error, setError] = useState(null);

    const url = localStorage.getItem("url");

    const ChangePhoneNumber = () => {
        navigate("/phone-enter");
    };

    const PasscodeEnter = async () => {
        try {
            const response = await fetch(`${url}/auth/password/code/verification`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ phoneNumber, code }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.message || `Ошибка ${response.status}`);
                } catch (parseError) {
                    throw new Error(errorText || `Ошибка ${response.status}`);
                }
            }

            setError(null);
            navigate("/password-reset");
        } catch (error) {
            setError(error.message);
            console.error("Произошла ошибка:", error);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <NotAuthTopBar />
            <Container
                fluid
                className="BG d-flex align-items-center justify-content-center"
                style={{
                    // backgroundColor: "#242582",
                    flex: 1,
                }}
            >
                <Row className="w-100">
                    <Col xs={12} md={8} lg={4} className="mx-auto">
                        <Card className=" CD p-4 shadow-lg">
                            <Card.Body>
                                <h2 className="HLW text-center mb-4">Подтверждение номера</h2>
                                <Form>
                                    <Form.Group controlId="formPhoneNumber" className="mb-3">
                                        {/* <Form.Label>Ваш номер телефона</Form.Label> */}
                                        <Form.Control
                                            type="text"
                                            value={phoneNumber}
                                            disabled
                                            className="rounded-pill p-3"
                                            style={{
                                                backgroundColor: "#e9ecef",
                                                border: "none",
                                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                            }}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="formCode" className="mb-3">
                                        <Form.Label>Вам поступит звонок, введите четыре последние цифры номера телефона</Form.Label>
                                        <InputMask
                                            mask="9999" // Маска для ввода кода (4 цифры)
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            alwaysShowMask={false} // Убирает пустые символы маски
                                        >
                                            {() => (
                                                <Form.Control
                                                    type="text"
                                                    placeholder="0000"
                                                    className="rounded-pill p-3 text-center"
                                                    style={{
                                                        backgroundColor: "#ffffff",
                                                        border: "none",
                                                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                                    }}
                                                />
                                            )}
                                        </InputMask>
                                    </Form.Group>
                                    {error && (
                                        <p className="text-danger text-center mt-2">Ошибка: {error}</p>
                                    )}
                                    <div className="d-grid gap-2">
                                        <Button
                                            variant="primary"
                                            className="rounded-pill"
                                            style={{
                                                backgroundColor: "#ff7101",
                                                border: "none",
                                                fontSize: "18px",
                                            }}
                                            onClick={PasscodeEnter}
                                        >
                                            Подтвердить
                                        </Button>
                                        <Button
                                            variant="link"
                                            className="text-decoration-none text-center"
                                            style={{ color: "#ff7101" }}
                                            onClick={ChangePhoneNumber}
                                        >
                                            Изменить номер телефона
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CodeEnteringPage;
