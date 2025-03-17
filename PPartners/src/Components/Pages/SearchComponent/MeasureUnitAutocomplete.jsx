import React, { useState, useEffect } from 'react';

const MeasureUnitAutocomplete = ({ onSelect, value, disabled }) => {
    const [query, setQuery] = useState(value || '');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false); // Добавлено состояние фокуса
    const url = localStorage.getItem('url');
    const getAuthToken = () => localStorage.getItem('authToken');

    useEffect(() => {
        if (query.length === 0 || !isFocused) { // Показываем результаты только если есть фокус
            setResults([]);
            return;
        }

        const fetchMeasureUnits = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${url}/categories/measurement-unit/filter?query=${encodeURIComponent(query)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Ошибка при загрузке данных');
                }
                const data = await response.json();
                setResults(data.measurementUnits);
            } catch (error) {
                console.error('Ошибка при загрузке единиц измерения:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchMeasureUnits, 300); // Задержка для предотвращения лишних запросов
        return () => clearTimeout(timeoutId);
    }, [query, isFocused]);

    const handleSelect = (unit) => {
        setQuery(unit);
        onSelect(unit);
        setResults([]);
        setIsFocused(false); // Убираем фокус после выбора
    };

    return (
        <div style={styles.autocompleteWrapper}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Введите единицу измерения"
                style={styles.input}
                disabled={disabled}
                onFocus={() => setIsFocused(true)} // При фокусе показываем список
                onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Скрываем после потери фокуса
            />
            {isFocused && results.length > 0 && (
                <ul style={styles.resultsList}>
                    {results.map((unit, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelect(unit)}
                            style={styles.resultItem}
                            onMouseEnter={(e) => (e.target.style.backgroundColor = '#f0f8ff')}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                        >
                            {unit}
                        </li>
                    ))}
                </ul>
            )}
            {loading && isFocused && <div style={styles.loading}>Загрузка...</div>}
        </div>
    );
};

const styles = {
    autocompleteWrapper: {
        position: 'relative',
        width: '80px', // Увеличили ширину контейнера
        fontFamily: 'Arial, sans-serif',
    },
    input: {
        width: '100%',
        padding: '10px 12px',
        fontSize: '16px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: '#fff',
        color: '#333',
        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
        transition: 'border-color 0.2s ease',
        '&:focus': {
            borderColor: '#4a90e2',
        },
    },
    resultsList: {
        position: 'absolute',
        zIndex: 1000,
        width: '100%',
        maxHeight: '200px',
        overflowY: 'auto',
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginTop: '5px',
        padding: '0',
        listStyle: 'none',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        scrollbarWidth: 'thin', // Для Firefox
        scrollbarColor: '#ccc transparent', // Для Firefox
    },
    resultItem: {
        padding: '10px 12px',
        cursor: 'pointer',
        color: '#333',
        transition: 'background-color 0.2s ease',
        ':hover': {
            backgroundColor: '#f0f8ff',
        },
    },
    loading: {
        padding: '8px',
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
    },
};

export default MeasureUnitAutocomplete;