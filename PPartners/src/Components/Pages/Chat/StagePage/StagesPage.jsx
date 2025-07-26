import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../../TopBars/TopBar';
import { useProfile } from '../../../Context/ProfileContext';
import { Container, Row, Col } from "react-bootstrap";
import StageCard from './StageCard';
import './StagesPage.css';

const StagesPage = () => {
    const [stagePreviews, setStagePreviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const getAuthToken = useCallback(() => localStorage.getItem('authToken'), []);
    const url = localStorage.getItem('url');
    const { isSpecialist } = useProfile();
    const navigate = useNavigate();

    const fetchStage = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({ isSpecialist });
            const agreementsResponse = await fetch(`${url}/agreement/agreements?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                }
            });

            if (!agreementsResponse.ok) {
                throw new Error('Не удалось загрузить соглашения');
            }

            const agreementsData = await agreementsResponse.json();
            const agreementIds = agreementsData.agreementIds || [];

            const previewsResponse = await fetch(`${url}/stages/previews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify({ agreementIds }),
            });

            if (!previewsResponse.ok) {
                throw new Error('Не удалось загрузить этапы');
            }

            const previewsData = await previewsResponse.json();
            setStagePreviews(previewsData.stagePreviews || []);
        } catch (err) {
            console.error('Ошибка загрузки:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [isSpecialist, url, getAuthToken]);

    useEffect(() => {
        fetchStage();
    }, [fetchStage]);

    const handleStagePreviewClick = useCallback(async (agreementId) => {
        try {
            const paramsAgreement = new URLSearchParams({ agreementId });
            const agreementResponse = await fetch(`${url}/agreement?${paramsAgreement.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                }
            });

            if (!agreementResponse.ok) {
                throw new Error(`Ошибка сети: ${agreementResponse.status}`);
            }

            const agreementData = await agreementResponse.json();
            const chatId = agreementData.agreementInfo.chatId;

            navigate(`/chat/${chatId}?tab=stages`, {
                state: { agreementId }
            });
            localStorage.setItem('agreementId', agreementId);
        } catch (err) {
            console.error('Ошибка навигации:', err);
            setError('Не удалось перейти к этапам');
        }
    }, [url, getAuthToken, navigate]);

    const renderStageGroups = () => {
        return stagePreviews.map((stageGroup, groupIndex) => {
            const isEmptyGroup = stageGroup.length === 0;
            const groupAgreementId = isEmptyGroup
                ? `empty_group_${groupIndex}`
                : stageGroup[0].agreementId;

            return (
                <div
                    key={`group_${groupIndex}`}
                    onClick={() => handleStagePreviewClick(groupAgreementId)}
                    className="stage-group-container clickable-group"
                >
                    {isEmptyGroup ? (
                        <div className="stage-group-empty">
                            <span>Нет активных этапов</span>
                            <div className="text-muted mt-2">Нажмите, чтобы создать</div>
                        </div>
                    ) : (
                        stageGroup.map((stage) => (
                            <StageCard
                                key={`stage_${stage.id}`}
                                stage={stage}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStagePreviewClick(stage.agreementId);
                                }}
                            />
                        ))
                    )}
                </div>
            );
        });
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <TopBar />
            <Container fluid style={{ flex: 1, padding: "20px" }} className="BG">
                <Row className="justify-content-center">
                    <Col xs={12} md={10} lg={8}>
                        <h2 className="text-center mb-4 text-white">Этапы работ</h2>
                    </Col>

                    {isLoading ? (
                        <div className="text-center">
                            <div className="spinner-border text-light" role="status">
                                <span className="visually-hidden">Загрузка...</span>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="alert alert-danger text-center">
                            {error}
                            <button
                                className="btn btn-sm btn-outline-light ms-3"
                                onClick={fetchStage}
                            >
                                Повторить
                            </button>
                        </div>
                    ) : stagePreviews.length > 0 ? (
                        <div className="stages-grid">
                            {renderStageGroups()}
                        </div>
                    ) : (
                        <div className="text-center text-white py-5">
                            <h4>У вас пока нет этапов работ</h4>
                            <button
                                className="btn btn-primary mt-3"
                                onClick={() => navigate(`/account-actions?tab=offers`)}
                            >
                                Создать новое соглашение
                            </button>
                        </div>
                    )}
                </Row>
            </Container>
        </div>
    );
};

export default StagesPage;