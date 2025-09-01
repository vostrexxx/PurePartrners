import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Row, Col, Form } from "react-bootstrap";
import EmptyTopBar from "../../TopBars/EmptyTopBar";
import InputMask from "react-input-mask";
import ErrorMessage from "../../ErrorHandling/ErrorMessage.jsx";

const IdentificationPage = () => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isValid, setIsValid] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    localStorage.setItem("phoneNumber", phoneNumber);
    localStorage.setItem("url", "http://192.168.1.12:8887");
    // localStorage.setItem("url", "https://api.партнеры.online");

    localStorage.setItem("authToken", null);
    const url = localStorage.getItem("url");

    const handleInputChange = (e) => {
        let value = e.target.value;

        if (value.startsWith("8")) {
            value = value.replace("8", "+7");
        }

        setPhoneNumber(value);

        const isValidPhone = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(value);
        setIsValid(isValidPhone);
        setError(null);
    };

    const handleSubmit = async (e) => {
        // Предотвращаем стандартное поведение формы
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        if (isValid) {
            const response = await fetch(url + "/auth/checkPhoneNumber", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ phoneNumber }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.success === 1) {
                    navigate("/login", { state: { phoneNumber } });
                } else if (data.success === 0) {
                    navigate("/register", { state: { phoneNumber } });
                }
            } else {
                setError({message: data.userFriendlyMessage, status: data.status});
            }
        }
    };

    // Обработчик отправки формы
    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSubmit(e);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <EmptyTopBar />
            <Container
                fluid
                className="BG d-flex align-items-center justify-content-center"
                style={{
                    flex: 1,
                }}
            >
                <Row
                    className=" w-100"
                    style={{
                        position: "relative",
                        top: "-150px",
                    }}
                >
                    <Col xs={12} md={8} lg={4} className="mx-auto">
                        <h2 className="HLL text-center mb-4">Вход и регистрация</h2>
                        {/* Добавляем onSubmit к форме */}
                        <Form className="text-center" onSubmit={handleFormSubmit}>
                            <Form.Group controlId="formPhoneNumber">
                                <InputMask
                                    mask="+7 (999) 999-99-99"
                                    value={phoneNumber}
                                    onChange={handleInputChange}
                                    onFocus={() => setError(null)}
                                >
                                    {() => (
                                        <Form.Control
                                            type="text"
                                            placeholder="Введите номер телефона"
                                            className="IF rounded-pill p-3 text-center"
                                            style={{
                                                border: isValid ? "none" : "1px solid red",
                                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                            }}
                                            isInvalid={!isValid}
                                        />
                                    )}
                                </InputMask>
                                <ErrorMessage
                                    message={error?.message}
                                    statusCode={error?.status}
                                />
                            </Form.Group>
                            {/* Кнопка теперь с type="submit" */}
                            <Button
                                className="mt-3 rounded-pill"
                                type="submit"
                                style={{
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