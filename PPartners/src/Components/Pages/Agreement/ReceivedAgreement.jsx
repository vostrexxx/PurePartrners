import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import Agreement from '../../Previews/Agreement';
import { useProfile } from '../../Context/ProfileContext';

const getAuthToken = () => localStorage.getItem('authToken');
let url = localStorage.getItem('url');

const ReceivedAgreement = () => {
    const [agreements, setAgreements] = useState([]);
    const { isSpecialist } = useProfile();
    const [trigger, setTrigger] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams({
                    mode: isSpecialist ? 1 : 0,
                });
                const response = await fetch(`${url}/agreement/received?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}`,
                    }
                });

                if (!response.ok) {
                    throw new Error(`Ошибка сети: ${response.status}`);
                }

                const data = await response.json();
                setAgreements(data.agreements);
            } catch (error) {
                setError('Ошибка при загрузке данных.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isSpecialist, trigger]);

    const toggleTrigger = () => setTrigger(prev => !prev);

    return (
        <Container className="mt-4">
            <h2 className="text-center mb-4 text-white">На что вам откликнулись</h2>
            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : agreements.length > 0 ? (
                <Row>
                    {agreements.map((item, index) => (
                        <Col key={index} className="mb-2">
                            {/* <Card className="shadow-sm"> */}
                            <Card.Body>
                                <Agreement
                                    id={item.id}
                                    mode={item.mode}
                                    initiatorId={item.initiatorId}
                                    initiatorItemId={item.initiatorItemId}
                                    receiverId={item.receiverId}
                                    receiverItemId={item.receiverItemId}
                                    localizedStatus={item.localizedStatus}
                                    comment={item.comment}
                                    updateDate={item.updateDate}
                                    isReceiver={true}
                                    chatId={item.chatId}
                                    isSpecialist={isSpecialist}
                                    onTrigger={toggleTrigger}
                                />
                            </Card.Body>
                            {/* </Card> */}
                        </Col>
                    ))}
                </Row>
            ) : (
                <Alert variant="info">Нет откликов</Alert>
            )}
        </Container>
    );
};

export default ReceivedAgreement;
