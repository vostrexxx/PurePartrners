import React, { useEffect, useState } from 'react';
import TopBar from '../TopBar/TopBar';

const BalancePage = () => {
    const url = localStorage.getItem('url');
    const authToken = localStorage.getItem('authToken');

    const [currBalance, setCurrBalance] = useState(0);
    const [isTopUpFormVisible, setIsTopUpFormVisible] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [error, setError] = useState(null);
    const [trigger, setTrigger] = useState(false);
    const [history, setHistory] = useState([]); // История списания

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
                setHistory(data.history || []); // Сохраняем историю списания
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
            setCurrBalance(data.balance);
            setTopUpAmount('');
            setIsTopUpFormVisible(false);
            setError(null);
        } catch (error) {
            setError(`Не удалось пополнить баланс: ${error.message}`);
        }
        setTrigger(!trigger);
    };

    return (
        <>
            <TopBar />
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

            {/* Блок с историей списания */}
            <h3>История списания:</h3>
            <div style={{
                marginTop: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px',
            }}>
                {history.length > 0 ? (
                    history.map((item, index) => (
                        <div
                            key={index}
                            style={{
                                border: '1px solid #ccc',
                                borderRadius: '10px',
                                padding: '15px',
                                backgroundColor: 'grey',
                                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            <p><strong>Дата:</strong> {new Date(item.paymentTimestamp).toLocaleString()}</p>
                            <p><strong>Стоимость:</strong> {item.paycheck} руб.</p>
                            <p><strong>Наименование объявления:</strong> {item.workCategories}</p>
                            <p><strong>Наименование этапа:</strong> {item.stageTitle}</p>
                            <p><strong>Адрес работ:</strong> {item.address}</p>
                        </div>
                    ))
                ) : (
                    <p>История списания пуста.</p>
                )}
            </div>
        </>
    );
};

export default BalancePage;
