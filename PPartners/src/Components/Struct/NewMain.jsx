import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../../Components/Pages/TopBar/TopBar'
import { useProfile } from '../Context/ProfileContext';
import { Container, Row, Col, Nav, Tab, Button } from "react-bootstrap";
import './Struct.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
    faPlus,
    faSearch,
    faHand,
    faHandshake,
    faWallet,
    faComments,
    faNewspaper,
    faStairs,
    faFileExcel,
    faUser
} from '@fortawesome/free-solid-svg-icons'
const NewMain = () => {
    const [chatPreviews, setChatPreviews] = useState([]);
    const getAuthToken = () => localStorage.getItem('authToken');
    let url = localStorage.getItem('url');
    const { isSpecialist } = useProfile();
    const navigate = useNavigate();

    const handleClickCreate = () => {
        navigate(`/account-actions?tab=offers`)
    };

    const handleClickSearch = () => {
        navigate(`/main`)
    };

    const handleClickResponse = () => {
        navigate(`/agreement`)
    };

    const handleClickChats = () => {
        navigate(`/all-chats`)
    };

    const handleClickEstimate = () => {
        // navigate(`/main`)
        alert('Сделать страницу со всеми сметами')
    };

    const handleClickStages = () => {
        // navigate(`/main`)
        alert('Сделать страницу со всеми стадиями')

    };

    const handleClickView = () => {
        // navigate(`/main`)
        alert('Сделать страницу со всеми соглашениями')

    };

    const handleClickPersonal = () => {
        navigate(`/account-actions?tab=personal-info`)
    };

    const handleClickBalance = () => {
        navigate(`/balance`)
    };



    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <TopBar />
            <Container fluid className="BG" style={{ flex: 1, padding: "20px" }}>
                <Row className="justify-content-center">
                    <Col xs={12} md={10} lg={8}>
                        <h2 className="text-center mb-4 text-white">PARTNERS</h2>
                    </Col>
                </Row>

                <Row className="justify-content-center g-3">

                    <Col xs={4} className="button-container">
                        <Button className='main-button' onClick={handleClickCreate}><FontAwesomeIcon className='main-icon' icon={faPlus} /> </Button>
                        <div className='under-button-text'>Ваши {isSpecialist ? ("анкеты") : ("объявления")}</div>
                    </Col>

                    {/* <Col xs={4} className="button-container">
                        <Button className='main-button'> <FontAwesomeIcon className='main-icon' icon={faPlus} /> </Button>
                        <div className='under-button-text'>Создать {isSpecialist ? ("анкету") : ("объявление")}</div>
                    </Col> */}

                    <Col xs={4} className="button-container">
                        <Button className='main-button' onClick={handleClickSearch}><FontAwesomeIcon className='main-icon' icon={faSearch} /> </Button>
                        <div className='under-button-text'>Поиск {!isSpecialist ? ("анкет") : ("объявлений")}</div>

                    </Col>
                    <Col xs={4} className="button-container">
                        <Button className='main-button' onClick={handleClickResponse}><FontAwesomeIcon className='main-icon' icon={faHand} /> </Button>
                        <div className='under-button-text'>Отклики</div>
                    </Col>

                    <Col xs={4} className="button-container">
                        <Button className='main-button' onClick={handleClickChats}><FontAwesomeIcon className='main-icon' icon={faComments} /> </Button>

                        <div className='under-button-text'>Чаты</div>

                    </Col>
                    <Col xs={4} className="button-container">
                        <Button className='main-button' onClick={handleClickEstimate}><FontAwesomeIcon className='main-icon' icon={faFileExcel} /> </Button>
                        <div className='under-button-text'>Сметы</div>

                    </Col>
                    <Col xs={4} className="button-container">
                        <Button className='main-button' onClick={handleClickStages}><FontAwesomeIcon className='main-icon' icon={faStairs} /> </Button>
                        <div className='under-button-text'>Этапы</div>

                    </Col>

                    <Col xs={4} className="button-container">
                        <Button className='main-button' onClick={handleClickView}><FontAwesomeIcon className='main-icon' icon={faHandshake} /> </Button>
                        <div className='under-button-text'>Соглашения</div>

                    </Col>

                    {!isSpecialist ? (<Col xs={4} className="button-container">
                        <Button className='main-button' onClick={handleClickBalance}><FontAwesomeIcon className='main-icon' icon={faWallet} /> </Button>
                        <div className='under-button-text'>Баланс</div>
                    </Col>) : (null)}

                    <Col xs={4} className="button-container">
                        <Button className='main-button' onClick={handleClickPersonal}><FontAwesomeIcon className='main-icon' icon={faUser} /> </Button>
                        <div className='under-button-text'>Персональные данные</div>

                    </Col>

                </Row>
            </Container>
        </div>
    );
};

export default NewMain;
