import React, { useState } from 'react';
import TopBar from '../TopBar/TopBar';
import ReceivedAgreement from './ReceivedAgreement';
import SentAgreement from './SentAgreement';
import { useProfile } from '../../Context/ProfileContext';
import { Container, Row, Col, Nav, Tab } from "react-bootstrap";

const AgreementPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index) => {
    setActiveTab(index);
  };


  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <TopBar />
      <Container
        fluid
        style={{
          backgroundColor: "#242582",
          flex: 1,
          padding: "20px",
        }}
      >
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8}>
            <h2 className="text-center mb-4 text-white">Отклики</h2>
            <Tab.Container defaultActiveKey="tab1">
              <Nav
                variant="pills"
                className="d-flex flex-row justify-content-center gap-3 mb-3"
                style={{ flexWrap: "nowrap" }}
              >
                <Nav.Item>
                  <Nav.Link
                    eventKey="tab1"
                    className="rounded-pill fw-bold text-center custom-tab"
                  >
                    Ваши отклики
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    eventKey="tab2"
                    className="rounded-pill fw-bold text-center custom-tab"
                  >
                    Отлкики вам
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              <Tab.Content>
                <Tab.Pane eventKey="tab1">
                  <SentAgreement />
                </Tab.Pane>
                <Tab.Pane eventKey="tab2">
                  <ReceivedAgreement />
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Col>
        </Row>
      </Container>

      {/* Стилизация активного и неактивных табов */}
      <style>
        {`
          .custom-tab {
            padding: 10px 20px;
            background-color: #e9ecef;
            color: #242582;
            transition: background-color 0.3s, color 0.3s;
          }

          .custom-tab.active {
            background-color: #ff7101 !important;
            color: white !important;
            font-weight: bold;
          }
        `}
      </style>
    </div>
  );


  // return (
  //   <div>
  //     <TopBar />
  //     <h1>Отклики</h1>
  //     <div className="tabs">
  //       <button onClick={() => handleTabClick(0)}>Ваши отклики</button>
  //       <button onClick={() => handleTabClick(1)}>Отклики Вам</button>
  //     </div>

  //     <div className="tab-content">
  //       {activeTab === 0 && <SentAgreement />}
  //       {activeTab === 1 && <ReceivedAgreement />}
  //     </div>
  //   </div>
  // );
};

export default AgreementPage;