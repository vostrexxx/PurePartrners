import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Row, Col, Form, Card } from "react-bootstrap";
import NotAuthTopBar from "../TopBar/NotAuthTopBar";
import ErrorMessage from "../../ErrorHandling/ErrorMessage";
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useToast } from '../../Notification/ToastContext'
const RegistrationPage = () => {
    const showToast = useToast();
    const [errorMessage, setErrorMessage] = useState(null);
    const [errorCode, setErrorCode] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem("phoneNumber"));
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const url = localStorage.getItem("url");

    const ChangePhoneNumber = () => {
        navigate("/identification");
    };

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            showToast("Пароли не совпадают", 'warning');
            return;
        }

        try {
            const response = await fetch(url + "/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ phoneNumber, password }),
            });

            if (!response.ok) {
                setErrorCode(response.status);
                setErrorMessage("Ошибка регистрации. Проверьте данные.");
                return;
            } else {
                const data = await response.json();
                navigate("/login", { state: { phoneNumber } });
            }
        } catch (error) {
            setErrorCode(null);
            setErrorMessage("Произошла ошибка регистрации.");
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <NotAuthTopBar />
            <Container
                fluid
                className="d-flex align-items-center justify-content-center"
                style={{
                    backgroundColor: "#242582",
                    flex: 1,
                }}
            >
                <Row className="w-100">
                    <Col xs={12} md={8} lg={4} className="mx-auto">
                        <Card className="p-4 shadow-lg">
                            <Card.Body>
                                <h2 className="text-center mb-4">Регистрация</h2>
                                <Form>
                                    <Form.Group controlId="formPhoneNumber" className="mb-3">
                                        {/* <Form.Label>Ваш номер телефона</Form.Label> */}
                                        <Form.Control
                                            type="text"
                                            value={phoneNumber}
                                            placeholder="+7 (***) ***-**-**"
                                            disabled
                                            className="rounded-pill p-3"
                                            style={{
                                                backgroundColor: "#e9ecef",
                                                border: "none",
                                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                            }}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="formPassword" className="mb-3 position-relative">
                                        {/* <Form.Label>Введите пароль</Form.Label> */}
                                        <Form.Control
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Введите пароль"
                                            className="rounded-pill p-3"
                                            style={{
                                                backgroundColor: "#ffffff",
                                                border: "none",
                                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                            }}
                                        />
                                        <FontAwesomeIcon
                                            icon={showPassword ? faEyeSlash : faEye}
                                            className="position-absolute top-50 end-0 translate-middle-y me-3"
                                            style={{ cursor: "pointer", color: "#888" }}
                                            onClick={() => setShowPassword(!showPassword)}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="formConfirmPassword" className="mb-3p osition-relative">
                                        {/* <Form.Label>Подтвердите пароль</Form.Label> */}
                                        <Form.Control
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Подтвердите пароль"
                                            className="rounded-pill p-3"
                                            style={{
                                                backgroundColor: "#ffffff",
                                                border: "none",
                                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                            }}
                                        />
                                    </Form.Group>
                                    <ErrorMessage message={errorMessage} errorCode={errorCode} />
                                    <div className="d-grid gap-2 mt-4">
                                        <Button
                                            variant="primary"
                                            className="rounded-pill"
                                            style={{
                                                backgroundColor: "#ff7101",
                                                border: "none",
                                                fontSize: "18px",
                                            }}
                                            onClick={handleRegister}
                                        >
                                            Зарегистрироваться
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

export default RegistrationPage;
