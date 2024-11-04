import React from 'react';

const Card = ({ title, description, date, onClick, key }) => {
    return (
        <div style={styles.card} onClick={onClick} key = {key}>
            <h3>{title}</h3>
            <p>{description}</p>
            <small>{date}</small>
        </div>
    );
};

const styles = {
    card: {
        color:'black', 
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        margin: '16px 0',
        cursor: 'pointer',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
};

export default Card;
