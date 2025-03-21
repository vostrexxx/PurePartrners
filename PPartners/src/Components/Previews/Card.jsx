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
            className={`card ${isSelected ? 'border-primary shadow' : ''}`}
            style={{ cursor: 'pointer', marginBottom: '16px' }}
            onClick={onClick}
        >
            <div className="card-body">
                <h5 className="card-title">{title}</h5>

                {type === 'announcement' ? (
                    <div>
                        {totalCost ? (<p className="card-text">Стоимость: {totalCost} руб.</p>) : null}
                        {address ? (<p className="card-text">Адрес: {address}</p>) : null}

                    </div>
                ) : (
                    <div>
                        {hasEdu ? (<p className="card-text">
                            {hasEdu ? 'Имеется профильное образование' : 'Не имеется профильное образование'}
                        </p>) : null}
                        {hasTeam ? (<p className="card-text">
                            {hasTeam ? 'Имеется команда' : 'Не имеется команды'}
                        </p>) : null}
                        {workExp ? (<p className="card-text">Опыт работы: {getYearWord(workExp)}</p>) : null}



                    </div>
                )}
            </div>
        </div>
    );
};

export default Card;