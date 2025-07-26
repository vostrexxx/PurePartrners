import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Row, Col, Form, Card } from "react-bootstrap";
import NotAuthTopBar from "../../TopBars/NotAuthTopBar";
import InputMask from "react-input-mask";

const PhoneNumberEnteringPage = () => {
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem("phoneNumber") || "");
    const [errorMessage, setErrorMessage] = useState(null);

    const url = localStorage.getItem("url");

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
                        <Card className="p-4 shadow-lg">
                            <Card.Body>
                                <h2 className="text-center mb-4">Введите номер телефона</h2>
                                <Form>
                                    <Form.Group controlId="formPhoneNumber" className="mb-3">
                                        <Form.Label>Ваш номер телефона</Form.Label>
                                        <InputMask
                                            mask="+7 (999) 999-99-99"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            onFocus={() => setErrorMessage(null)}
                                        >
                                            {() => (
                                                <Form.Control
                                                    type="text"
                                                    placeholder="+7 (***) ***-**-**"
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
                                    {errorMessage && (
                                        <p className="text-danger text-center mt-2">
                                            Ошибка: {errorMessage}
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
                                            onClick={handleEnterPhoneNumber}
                                        >
                                            Подтвердить
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

export default PhoneNumberEnteringPage;
