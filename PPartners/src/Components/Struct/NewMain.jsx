import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../TopBars/TopBar'
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
    faStairs,
    faFileExcel,
    faUser
} from '@fortawesome/free-solid-svg-icons'
const NewMain = () => {

    const getAuthToken = () => localStorage.getItem('authToken');
    let url = localStorage.getItem('url');
    const { isSpecialist } = useProfile();
    const navigate = useNavigate();

    const [agreementIds, setAgreementIds] = useState([]);

    useEffect(() => {
        const params = new URLSearchParams();
        params.append('isSpecialist', isSpecialist);
        const fetchAgreementIds = async () => {
            const response = await fetch(url + `/agreement/agreements?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                }
            });
            const data = await response.json();
            setAgreementIds(data.agreementIds);
        };

        fetchAgreementIds();

    }, [isSpecialist])

    const fetchPreviewData = async (id, type) => {
        if (!id) return;

        try {
            const params = new URLSearchParams();
            if (type === 'questionnaire') {
                params.append('questionnaireId', id);
            } else {
                params.append('announcementId', id);
            }

            const endpoint = type === 'questionnaire' ? 'questionnaire/preview' : 'announcement/preview';

            const response = await fetch(`${url}/${endpoint}?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (type === 'questionnaire') {
                    // setQuestionnaireData(data);
                    console.log('анкета', data)
                } else {
                    // setAnnouncementData(data);
                    console.log('объява', data)

                }
            } else {
                console.error(`Ошибка при загрузке данных (${type}):`, response.status);
            }
        } catch (error) {
            console.error(`Ошибка при выполнении запроса (${type}):`, error);
        }
    };

    const handleClickCreate = () => {
        navigate(`/account-actions?tab=offers`)
    };

    const handleClickSearch = () => {
        navigate(`/search`)
    };

    const handleClickResponse = () => {
        navigate(`/agreement`)
    };

    const handleClickChats = () => {
        navigate(`/all-chats`)
    };


    // if (agreementData.agreementInfo.mode === 1) {
    //     customerId = agreementData.agreementInfo.initiatorId;
    //     customerItemId = agreementData.agreementInfo.initiatorItemId;

    //     contractorId = agreementData.agreementInfo.receiverId;
    //     contractorItemId = agreementData.agreementInfo.receiverItemId;
    // }
    const handleClickEstimate = async () => {

        // agreementIds.map(async (agreementId) => {
        //     const response = await fetch(url + `/categories/previews`, {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'Authorization': `Bearer ${getAuthToken()}`,
        //         },
        //         body: JSON.stringify({ agreementIds: agreementIds }),
        //     });
        //     // return response.json();
        //     console.log(response.json())
        // })


        // console.log(agreementIds)
        navigate('/estimates');
        // const responses = await Promise.all(
        //     agreementIds.map(async (agreementId) => {
        //         const response = await fetch(url + `/agreement?agreementId=${agreementId}`, {
        //             method: 'GET',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //                 'Authorization': `Bearer ${getAuthToken()}`,
        //             }
        //         });
        //         return response.json();
        //     })
        // );

        // console.log(responses);


        // responses.forEach(response => {
        //     let agreementInfo = response.agreementInfo;
        //     // if (response.userId === agreementInfo.initiatorId) {
        //     // выводим только то, что принадлежит текущему пользователю 
        //     if (agreementInfo.mode) {
        //         fetchPreviewData(agreementInfo.receiverItemId, 'questionnaire');
        //         fetchPreviewData(agreementInfo.initiatorItemId, 'announcement');
        //     } else {
        //         fetchPreviewData(agreementInfo.initiatorItemId, 'questionnaire');
        //         fetchPreviewData(agreementInfo.receiverItemId, 'announcement');
        //     }
        //     // } else {

        //     // }
        // });
        // // Запрос на получение объяв
        // const responsesCustomer = await Promise.all(
        //     responses.map(async (agreementId) => {
        //         const responseCustomer = await fetch(url + `/agreement?agreementId=${agreementId}`, {
        //             method: 'GET',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //                 'Authorization': `Bearer ${getAuthToken()}`,
        //             }
        //         });
        //         return responseCustomer.json();
        //     })
        // );

        // console.log("responsesCustomer", responsesCustomer)

        // // Запрос на получение анкет
        // const responsesContractor = await Promise.all(
        //     responses.map(async (agreementId) => {
        //         const responseCustomer = await fetch(url + `/agreement?agreementId=${agreementId}`, {
        //             method: 'GET',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //                 'Authorization': `Bearer ${getAuthToken()}`,
        //             }
        //         });
        //         return responseCustomer.json();
        //     })
        // );
        // console.log("responsesContractor", responsesContractor)
    };
    // const handleClickEstimate = async () => {
    //     try {
    //         const response = await fetch(url + '/agreement/agreements', {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${getAuthToken()}`,
    //             }
    //         });

    //         if (!response.ok) {
    //             throw new Error(`Ошибка HTTP: ${response.status}`);
    //         }

    //         const data = await response.json();

    //         // Проверяем, что data.response — массив
    //         if (!Array.isArray(data?.response)) {
    //             throw new Error('Ожидался массив agreementIds');
    //         }

    //         navigate('/estimates', {
    //             state: {
    //                 agreementIds: data.response // Передаём массив
    //             }
    //         });
    //     } catch (error) {
    //         console.error('Ошибка при загрузке agreementIds:', error);
    //         alert('Не удалось загрузить данные. Проверьте консоль.');
    //     }
    // };

    const handleClickStages = async () => {
        // navigate(`/main`)
        navigate('/stages');


        // alert('Сделать страницу со всеми стадиями')

    };

    const handleClickView = () => {
        navigate(`/agreements`)
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
