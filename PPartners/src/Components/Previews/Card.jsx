import React from 'react';

const Card = ({ title, totalCost, address, onClick, isSelected, type, hasEdu, hasTeam, workExp }) => {

    function getYearWord(number) {
        if (number >= 11 && number <= 14) {
            return `${number} лет`;
        }

        const lastDigit = number % 10;

        if (lastDigit === 1) {
            return `${number} год`;
        } else if (lastDigit >= 2 && lastDigit <= 4) {
            return `${number} года`;
        } else {
            return `${number} лет`;
        }
    }

    return (
        <div
            style={{
                ...styles.card,
                backgroundColor: isSelected ? '#b3d9ff' : '#fff', // Изменение фона при выборе
                border: isSelected ? '2px solid blue' : '1px solid #ccc',
            }}
            onClick={onClick}
        >

            <h3>{title}</h3>

            {type === 'announcement' ? (
                <div>
                    <p> Стоимость: {totalCost} руб.</p>
                    <p> Адрес: {address}</p>
                </div>) : (
                <div>
                    <p>{hasEdu ? 'Имеется профильное образование' : 'Не имеется профильное образование'}</p>
                    <p>{hasTeam ? 'Имеется команда' : 'Не имеется команды'}</p>
                    <p> Опыт работы: {getYearWord(workExp)}</p>
                </div>)}


        </div>
    );
};

const styles = {
    card: {
        color: 'black',
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
