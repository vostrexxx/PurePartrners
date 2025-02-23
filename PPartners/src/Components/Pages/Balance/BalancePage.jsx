import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button, Form } from 'react-bootstrap';
import TopBar from '../TopBar/TopBar';

const getAuthToken = () => localStorage.getItem('authToken');
let url = localStorage.getItem('url');

const BalancePage = () => {
    const [currBalance, setCurrBalance] = useState(0);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [isTopUpFormVisible, setIsTopUpFormVisible] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trigger, setTrigger] = useState(false);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const response = await fetch(`${url}/balance`, {
                    headers: {
                        'Authorization': `Bearer ${getAuthToken()}`,
                    },
                });
                const data = await response.json();
                setCurrBalance(data.balance);
                setHistory(data.history || []);
            } catch {
                setError('Ошибка при загрузке баланса');
            } finally {
                setLoading(false);
            }
        };
        fetchBalance();
    }, [trigger]);

    const handleTopUp = async () => {
        if (!topUpAmount || isNaN(topUpAmount) || topUpAmount <= 0) {
            setError('Введите корректную сумму для пополнения.');
            return;
        }

        try {
            const amountAsDouble = parseFloat(topUpAmount).toFixed(2);

            const response = await fetch(`${url}/balance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify({ balance: parseFloat(amountAsDouble) }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка пополнения баланса: ${response.status}`);
            }

            const data = await response.json();
            setCurrBalance(data.balance);
            // setTopUpAmount('');
            setIsTopUpFormVisible(false);
            setError(null);
        } catch (error) {
            setError(`Не удалось пополнить баланс: ${error.message}`);
        }
        setTrigger(!trigger);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <TopBar />
        
        <Container fluid
        style={{
          backgroundColor: "#242582",
          flex: 1,
          padding: "20px",
        }}>
            <h2 className="text-center mb-4 text-white">Ваш баланс: {currBalance} руб.</h2>

            {isTopUpFormVisible ? (
                <Form className="mb-4">
                    <Form.Control
                        type="number"
                        placeholder="Введите сумму"
                        value={topUpAmount}
                        onChange={e => setTopUpAmount(e.target.value)}
                    />
                    <div className="d-flex gap-2 mt-2">
                        <Button variant="success" onClick={handleTopUp}>Отправить</Button>
                        <Button variant="secondary" onClick={() => setIsTopUpFormVisible(false)}>Отмена</Button>
                    </div>
                </Form>
            ) : (
                <Button variant="primary" className="mb-3 w-100" onClick={() => setIsTopUpFormVisible(true)}>Пополнить</Button>
            )}
            {error && <Alert variant="danger">{error}</Alert>}

            <h3 className="mt-4 text-white">История списания:</h3>
            {loading ? (
                <Spinner animation="border" />
            ) : history.length > 0 ? (
                <Row>
                    {history.map((item, idx) => (
                        <Col xs={12} md={6} lg={4} key={idx} className="mb-3">
                            <Card className="shadow-sm">
                                <Card.Body>
                                    <p><strong>Дата:</strong> {new Date(item.paymentTimestamp).toLocaleString()}</p>
                                    <p><strong>Стоимость:</strong> {item.paycheck} руб.</p>
                                    <p><strong>Категория:</strong> {item.workCategories}</p>
                                    <p><strong>Этап:</strong> {item.stageTitle}</p>
                                    <p><strong>Адрес:</strong> {item.address}</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Alert variant="info">История списания пуста</Alert>
            )}
        </Container>
        </div>
    );
};

export default BalancePage;
