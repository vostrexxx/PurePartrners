import React from "react";
import { Container, Row, Col, Nav, Tab } from "react-bootstrap";
import TopBar from "../TopBar/TopBar";
import Tab1 from "./Tab1";
import Tab2 from "./Tab2";
import Tab4 from "./Tab4";
import { useProfile } from "../../Context/ProfileContext";

const PageWithTabs = () => {
  const { isSpecialist } = useProfile();

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
            <h2 className="text-center mb-4 text-white">Личный кабинет</h2>
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
                    {isSpecialist ? "Ваши анкеты" : "Ваши объявления"}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    eventKey="tab2"
                    className="rounded-pill fw-bold text-center custom-tab"
                  >
                    Персональная информация
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              <Tab.Content>
                <Tab.Pane eventKey="tab1">
                  <Tab2 />
                </Tab.Pane>
                <Tab.Pane eventKey="tab2">
                  <Tab1 />
                </Tab.Pane>
                <Tab.Pane eventKey="tab3">
                  <Tab4 />
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
};

export default PageWithTabs;
