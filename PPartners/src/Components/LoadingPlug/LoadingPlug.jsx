import React from "react";
import {Container} from "react-bootstrap";
import EmptyTopBar from "../TopBars/EmptyTopBar.jsx";
import { ThreeDots, Oval, TailSpin, Rings } from "react-loader-spinner";

const LoadingPlug = () => {
    return (
        <div style={{display: "flex", flexDirection: "column", height: "100vh"}}>
            <EmptyTopBar/>
            <Container
                fluid
                className="BG d-flex align-items-center justify-content-center"
                style={{
                    flex: 1,
                }}
            >
                <div className="d-flex flex-column align-items-center">
                    <TailSpin
                        height="50"
                        width="50"
                        color="white"
                        ariaLabel="tail-spin-loading"
                        radius="1"
                        wrapperStyle={{ marginBottom: "20px" }}
                    />
                    <span style={{color:'white'}}>Загрузка...</span>
                </div>
            </Container>
        </div>
    );
};

export default LoadingPlug;