import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../TopBar/TopBar';
import { useProfile } from '../../../Context/ProfileContext';
import { Container, Row, Col } from "react-bootstrap";
import EstimateCard from './EstimateCard';

const EstimatesPage = () => {
    const [estimatePreviews, setEstimatePreviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const getAuthToken = useCallback(() => localStorage.getItem('authToken'), []);
    const url = localStorage.getItem('url');
    const { isSpecialist } = useProfile();
    const navigate = useNavigate();

    const fetchEstimates = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Fetch agreement IDs
            const params = new URLSearchParams({ isSpecialist });
            const agreementsResponse = await fetch(`${url}/agreement/agreements?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                }
            });

            if (!agreementsResponse.ok) {
                throw new Error('Failed to fetch agreements');
            }

            const agreementsData = await agreementsResponse.json();
            const agreementIds = agreementsData.agreementIds || [];

            // Fetch estimates preview
            const previewsResponse = await fetch(`${url}/categories/previews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify({ agreementIds }),
            });

            if (!previewsResponse.ok) {
                throw new Error('Failed to fetch estimates preview');
            }

            const previewsData = await previewsResponse.json();
            setEstimatePreviews(previewsData.estimatePreviews || []);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [isSpecialist, url, getAuthToken]);

    useEffect(() => {
        fetchEstimates();
    }, [fetchEstimates]);

    const handleEstimatePreviewClick = useCallback(async (agreementId) => {
        try {
            // Fetch agreement info
            const paramsAgreement = new URLSearchParams({ agreementId });
            const agreementResponse = await fetch(`${url}/agreement?${paramsAgreement.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                }
            });

            if (!agreementResponse.ok) {
                throw new Error(`Network error: ${agreementResponse.status}`);
            }

            const agreementData = await agreementResponse.json();
            const chatId = agreementData.agreementInfo.chatId;

            // Fetch chat info
            const chatParams = new URLSearchParams({ chatId });
            const chatResponse = await fetch(`${url}/chat/info?${chatParams.toString()}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
            });

            if (!chatResponse.ok) {
                throw new Error(`Failed to get chat info: ${chatResponse.status}`);
            }

            const chatData = await chatResponse.json();
            navigate(`/chat/${chatId}?tab=builder`, {
                state: { agreementId: chatData.agreementId }
            });
            localStorage.setItem('agreementId', chatData.agreementId);
        } catch (err) {
            console.error('Navigation error:', err);
            // Здесь можно добавить обработку ошибки для пользователя
        }
    }, [url, getAuthToken, navigate]);

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <TopBar />
            <Container fluid style={{ flex: 1, padding: "20px" }} className="BG">
                <Row className="justify-content-center">
                    <Col xs={12} md={10} lg={8}>
                        <h2 className="text-center mb-4 text-white">Ваши сметы</h2>
                    </Col>

                    {isLoading ? (
                        <p className='text-white text-center'>Загрузка...</p>
                    ) : error ? (
                        <p className='text-white text-center'>Ошибка: {error}</p>
                    ) : estimatePreviews.length > 0 ? (
                        estimatePreviews.map((item) => (
                            <EstimateCard
                                key={item.agreementId}
                                estimate={item}
                                onClick={() => handleEstimatePreviewClick(item.agreementId)}
                            />
                        ))
                    ) : (
                        <p className='text-white text-center'>У вас пока что нет смет</p>
                    )}
                </Row>
            </Container>
        </div>
    );
};

export default EstimatesPage;