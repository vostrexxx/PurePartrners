import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Row, Col, Form, Card } from "react-bootstrap";
import NotAuthTopBar from "../../TopBars/NotAuthTopBar";

const PasswordResetPage = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);
    const phoneNumber = localStorage.getItem("phoneNumber") || "";

    const url = localStorage.getItem("url");

    const handlePasswordReset = async () => {
        if (password !== confirmPassword) {
            setErrorMessage("Пароли не совпадают");
            return;
        }

        try {
            const response = await fetch(url + "/auth/password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ phoneNumber, newPassword: password }),
            });

            if (!response.ok) {
                setErrorMessage("Ошибка при сбросе пароля. Попробуйте снова.");
                return;
            }

            navigate("/login");
        } catch (error) {
            setErrorMessage("Произошла ошибка. Попробуйте снова.");
            console.error("Ошибка сброса пароля:", error);
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
                        <Card className="p-4 shadow-lg">
                            <Card.Body>
                                <h2 className="HLD text-center mb-4">Сброс пароля</h2>
                                <Form>
                                    <Form.Group controlId="formNewPassword" className="mb-3">
                                        {/* <Form.Label>Введите новый пароль</Form.Label> */}
                                        <Form.Control
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Введите новый пароль"
                                            className="rounded-pill p-3"
                                            style={{
                                                backgroundColor: "#ffffff",
                                                border: "none",
                                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                            }}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="formConfirmPassword" className="mb-3">
                                        {/* <Form.Label>Подтвердите пароль</Form.Label> */}
                                        <Form.Control
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Подтвердите новый пароль"
                                            className="rounded-pill p-3"
                                            style={{
                                                backgroundColor: "#ffffff",
                                                border: "none",
                                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                            }}
                                        />
                                    </Form.Group>
                                    {errorMessage && (
                                        <p className="text-danger text-center mt-2">
                                            {errorMessage}
                                        </p>
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
                                            onClick={handlePasswordReset}
                                        >
                                            Сохранить
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

export default PasswordResetPage;
