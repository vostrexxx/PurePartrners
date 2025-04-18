import React from 'react';
import { Modal, Button, Form, Dropdown, Card } from "react-bootstrap";

const EstimateCard = ({ estimate, onClick }) => {
    // console.log('lastMessage', lastMessage)
    return (
        <div style={styles.card} onClick={onClick} className='mb-3'>
            <Card.Body>
                {/* <div>{estimate.price}</div> */}

                {estimate.price !== 0 ? (
                    <>
                        <b >Стоимость: </b>{estimate.price}

                        {/* <Card.Subtitle className="mb-2 ">Work categories:</Card.Subtitle> */}

                        <div className='mt-3' >
                            <b>Категории работ: </b>
                            <div
                                style={{
                                    maxHeight: '120px', // Примерно 4 строки
                                    overflowY: 'auto',
                                    border: '1px solid black',
                                    borderRadius: '4px',
                                    padding: '8px',
                                    marginBottom: '5px',
                                    marginTop: '5px'

                                }}
                            >
                                {estimate.subWorkCategories?.map((category, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            padding: '4px 0',
                                            borderBottom: index !== estimate.subWorkCategories.length - 1 ? '1px solid #f0f0f0' : 'none'
                                        }}
                                    >
                                        {category}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) :
                    <p>Ваша смета пуста, самое время её заполнить :)</p>}





            </Card.Body>
        </div>
    );
};

const styles = {
    card: {
        color: 'black',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        // margin: '16px 0',
        cursor: 'pointer',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    lastMessageTime: {
        fontSize: '6'
    }
};





export default EstimateCard;






