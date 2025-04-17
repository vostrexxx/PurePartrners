import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Chat from '../../Previews/Chat';
import TopBar from '../TopBar/TopBar'
import { useProfile } from '../../Context/ProfileContext';
import { Container, Row, Col, Nav, Tab } from "react-bootstrap";
import { useLocation } from 'react-router-dom';
const EstimatesPage = () => {

    const { id } = useParams();
    const getAuthToken = () => localStorage.getItem('authToken');
    let url = localStorage.getItem('url');
    const { isSpecialist } = useProfile();
    const navigate = useNavigate();

    const location = useLocation();
    const { agreementIds } = location.state || {};

    useEffect(() => {
        console.log(agreementIds)
    }, [])

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <TopBar />
            <Container
                fluid
                style={{
                    // backgroundColor: "#242582",
                    flex: 1,
                    padding: "20px",
                }}
                className="BG"

            >
                {/* <ul>
                    {agreementIds?.map((item, index) => (
                        <li key={index}>
                            {JSON.stringify(item)}
                        </li>
                    ))}
                </ul> */}


            </Container>
        </div>
    );
};

export default EstimatesPage;
