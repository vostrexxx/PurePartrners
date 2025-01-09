import React, { useEffect, useState } from 'react';
import TopBar from '../TopBar/TopBar';
const BalancePage = () => {
    const url = localStorage.getItem('url');
    const authToken = localStorage.getItem('authToken');

    const [currBalance, setCurrBalance] = useState(0);
    const [isTopUpFormVisible, setIsTopUpFormVisible] = useState(false); // Отображение формы пополнения
    const [topUpAmount, setTopUpAmount] = useState(''); // Сумма пополнения
    const [error, setError] = useState(null); // Ошибки
    const [trigger, setTrigger] = useState(false);

    useEffect(() => {
        const fetchGetBalance = async () => {
            try {
                const response = await fetch(`${url}/balance`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`Ошибка загрузки баланса: ${response.status}`);
                }

                const data = await response.json();
                setCurrBalance(data.balance);
            } catch (error) {
                setError(`Не удалось загрузить баланс: ${error.message}`);
            }
        };

        fetchGetBalance();
    }, [trigger]);

    const handleTopUp = async () => {
        if (!topUpAmount || isNaN(topUpAmount) || topUpAmount <= 0) {
            setError('Введите корректную сумму для пополнения.');
            return;
        }
    
        try {
            // Преобразуем сумму к типу double с двумя знаками после запятой
            const amountAsDouble = parseFloat(topUpAmount).toFixed(2);
    
            const response = await fetch(`${url}/balance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ balance: parseFloat(amountAsDouble) }),
            });
    
            if (!response.ok) {
                throw new Error(`Ошибка пополнения баланса: ${response.status}`);
            }
    
            const data = await response.json();
            setCurrBalance(data.balance); // Обновляем текущий баланс
            setTopUpAmount(''); // Сбрасываем поле ввода
            setIsTopUpFormVisible(false); // Скрываем форму
            setError(null); // Сбрасываем ошибки
    
        } catch (error) {
            setError(`Не удалось пополнить баланс: ${error.message}`);
        }
        setTrigger(!trigger);
    };
    

    return (
        <>
            <TopBar/>
            <h3>Ваш баланс:</h3>
            <div>{currBalance} руб.</div>
            {!isTopUpFormVisible ? (
                <button onClick={() => setIsTopUpFormVisible(true)}>Пополнить</button>
            ) : (
                <div>
                    <h4>Пополнение баланса</h4>
                    <input
                        type="number"
                        placeholder="Введите сумму"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                    />
                    <button onClick={handleTopUp}>Отправить</button>
                    <button onClick={() => setIsTopUpFormVisible(false)}>Отмена</button>
                </div>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </>
    );
};

export default BalancePage;
