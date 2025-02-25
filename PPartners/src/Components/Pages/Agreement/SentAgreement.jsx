import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import Agreement from '../../Previews/Agreement';
import { useProfile } from '../../Context/ProfileContext';

const getAuthToken = () => localStorage.getItem('authToken');
let url = localStorage.getItem('url');

const SentAgreement = () => {
    const [agreements, setAgreements] = useState([]);
    const { isSpecialist } = useProfile();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams({ mode: isSpecialist ? 0 : 1 });
                const response = await fetch(`${url}/agreement/sent?${params}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}`,
                    }
                });

                if (!response.ok) throw new Error(`Ошибка сети: ${response.status}`);

                const data = await response.json();
                setAgreements(data.agreements);
            } catch {
                setError('Ошибка при загрузке данных.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isSpecialist]);

    return (
        <Container className="mt-4">
            <h2 className="text-center mb-4 text-white">На что вы откликнулись</h2>
            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : agreements.length > 0 ? (
                <Row>
                    {agreements.map((item, index) => (
                        <Col xs={12} md={6} lg={4} key={index} className="mb-4">
                            <Agreement {...item} isReceiver={false} isSpecialist={isSpecialist} />
                        </Col>
                    ))}
                </Row>
            ) : (
                <Alert variant="info">Нет откликов</Alert>
            )}
        </Container>
    );
};

export default SentAgreement;
