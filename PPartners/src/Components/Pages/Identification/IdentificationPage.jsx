import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Row, Col, Form } from "react-bootstrap";
import NotAuthTopBar from "../TopBar/NotAuthTopBar";
import InputMask from "react-input-mask"; // Подключаем библиотеку для маски

const IdentificationPage = () => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isValid, setIsValid] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const navigate = useNavigate();

    localStorage.setItem("phoneNumber", phoneNumber);
    // localStorage.setItem("url", "http://192.168.1.12:8887");
    localStorage.setItem("url", "https://api.партнеры.online");
    // localStorage.setItem("url", "https://api.партнеры.online");


    localStorage.setItem("authToken", null);
    const url = localStorage.getItem("url");

    const handleInputChange = (e) => {
        let value = e.target.value;

        // Если ввод начинается с "8", заменяем её на "+7"
        if (value.startsWith("8")) {
            value = value.replace("8", "+7");
        }

        setPhoneNumber(value);

        // Проверка валидности
        const isValidPhone = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(value);
        setIsValid(isValidPhone);
        setErrorMessage(null);
    };

    const handleSubmit = async () => {
        if (isValid) {
            try {
                const response = await fetch(url + "/auth/checkPhoneNumber", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ phoneNumber }),
                });

                if (!response.ok) {
                    return;
                }

                const data = await response.json();

                if (data.success === 1) {
                    navigate("/login", { state: { phoneNumber } });
                } else if (data.success === 0) {
                    navigate("/register", { state: { phoneNumber } });
                }
            } catch (error) {
                setErrorMessage("Произошла ошибка. Проверьте соединение с интернетом.");
            }
        } else {
            setErrorMessage("Неверный формат номера телефона. Введите корректный номер.");
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
                    flex: 1, // Занимает оставшееся пространство
                }}
            >
                <Row
                    className="w-100"
                    style={{
                        position: "relative",
                        top: "-150px", // Поднимет блок выше
                    }}
                >
                    <Col xs={12} md={8} lg={4} className="mx-auto">
                        <h2 className="text-center text-white mb-4">Вход и регистрация</h2>
                        <Form className="text-center">
                            <Form.Group controlId="formPhoneNumber">
                                {/* Поле ввода с маской */}
                                <InputMask
                                    mask="+7 (999) 999-99-99" // Маска для российского номера
                                    value={phoneNumber}
                                    onChange={handleInputChange}
                                    onFocus={() => setErrorMessage(null)}
                                >
                                    {() => (
                                        <Form.Control
                                            type="text"
                                            placeholder="Введите номер телефона"
                                            className="rounded-pill p-3 text-center"
                                            style={{
                                                backgroundColor: "#ffffff",
                                                border: isValid ? "none" : "1px solid red",
                                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                            }}
                                            isInvalid={!isValid}
                                        />
                                    )}
                                </InputMask>
                                <Form.Control.Feedback type="invalid">
                                    {errorMessage}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Button
                                className="mt-4 rounded-pill"
                                style={{
                                    backgroundColor: "#ff7101",
                                    border: "none",
                                    padding: "10px 30px",
                                    fontSize: "18px",
                                }}
                                onClick={handleSubmit}
                                disabled={!isValid}
                            >
                                Продолжить
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default IdentificationPage;
