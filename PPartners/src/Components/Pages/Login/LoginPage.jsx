import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Container, Row, Col, Form, Card } from "react-bootstrap";
import NotAuthTopBar from "../TopBar/NotAuthTopBar";
import ErrorMessage from "../../ErrorHandling/ErrorMessage";
import { requestPermission } from "../../../../firebase";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const LoginPage = () => {
    const [errorMessage, setErrorMessage] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem("phoneNumber"));
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();
    const url = localStorage.getItem("url");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        try {
            const response = await fetch(`${url}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ phoneNumber, password }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Ошибка ${response.status}`);
            }

            const data = await response.json();
            const token = data.token;
            const userId = data.userId;

            localStorage.setItem("authToken", token);
            localStorage.setItem("userId", userId);

            requestPermission().then(fcmToken => {
                if (fcmToken) {
                    console.log('FCM Token получен и отправлен на сервер:', fcmToken);
                } else {
                    console.warn('FCM Token не был получен.');
                }
            });

            navigate("/main");
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    const handlePasswordReset = () => navigate("/phone-enter");
    const ChangePhoneNumber = () => navigate("/identification");
    function formatPhoneNumber(phone) {
        // Удаляем все символы, кроме цифр и знака "+"
        const cleaned = phone.replace(/[^\d+]/g, '');

        // Проверяем, начинается ли номер с "+7"
        if (cleaned.startsWith('+7')) {
            return cleaned; // Если номер уже в правильном формате, возвращаем его
        }

        // Если номер начинается с "7" (без "+"), добавляем "+" в начало
        if (cleaned.startsWith('7')) {
            return `+${cleaned}`;
        }

        // Если номер начинается с "8" (российский формат), заменяем "8" на "+7"
        if (cleaned.startsWith('8')) {
            return `+7${cleaned.slice(1)}`;
        }

        // Если номер не соответствует ни одному из вышеуказанных форматов, возвращаем его как есть
        return cleaned;
    }

    const handleEnterPhoneNumber = async () => {
        try {
            const response = await fetch(url + "/auth/password/code", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ phoneNumber }),
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

            navigate("/passcode-enter");
        } catch (error) {
            setErrorMessage(error.message);
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
                        <Card className="CD p-4 shadow-lg">
                            <Card.Body>
                                <h2 className="HLD text-center mb-4">Вход</h2>
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
                                        {/* Поле ввода пароля */}
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
                                    {/* <Form.Group controlId="formRememberMe" className="mb-3">
                                        <Form.Check
                                            type="checkbox"
                                            label="Запомнить меня"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                    </Form.Group> */}
                                    <ErrorMessage message={errorMessage} />
                                    <div className="d-grid gap-2">
                                        <Button
                                            variant="primary"
                                            className="rounded-pill"
                                            style={{
                                                backgroundColor: "#ff7101",
                                                border: "none",
                                                fontSize: "18px",
                                            }}
                                            onClick={handleLogin}
                                        >
                                            Войти
                                        </Button>
                                        <Button
                                            variant="link"
                                            className="text-decoration-none text-center"
                                            style={{ color: "#ff7101" }}
                                            onClick={handleEnterPhoneNumber}
                                        >
                                            Забыли пароль?
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

export default LoginPage;
