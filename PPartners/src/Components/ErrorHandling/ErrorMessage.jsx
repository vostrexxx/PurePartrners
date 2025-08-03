import React, {useEffect} from 'react';

const ErrorMessage = ({ message, statusCode }) => {
    if (!message && !statusCode) return null;
    useEffect(() => {
        // console.log(message, statusCode);
    }, [message, statusCode]);
    const getStandardMessage = (code) => {
        const messages = {
            400: 'Некорректный запрос',
            401: 'Необходима авторизация',
            403: 'Доступ запрещен',
            404: 'Страница не найдена',
            408: 'Время ожидания истекло',
            500: 'Внутренняя ошибка сервера',
            502: 'Ошибка шлюза',
            503: 'Сервис временно недоступен',
            504: 'Время ожидания шлюза истекло'
        };
        return messages[code] || 'Произошла ошибка';
    };

    const getErrorColor = (code) => {
        if (!code) return 'red';

        if (code >= 500) {
            return '#dc3545';
        } else if (code >= 400) {
            return '#fd7e14';
        }
        return 'red';
    };

    const displayMessage = message || getStandardMessage(statusCode);
    // const errorColor = getErrorColor(statusCode);
    const errorColor = 'red';

    return (
        <div style={{
            color: errorColor,
            margin: '10px',
            padding: '10px',
            border: `1px solid ${errorColor}`,
            borderRadius: '4px',
            backgroundColor: `${errorColor}10`
        }}>
            {/*{statusCode && (*/}
            {/*    <strong>Ошибка {statusCode}: </strong>*/}
            {/*)}*/}
            {displayMessage}
        </div>
    );
};

export default ErrorMessage;