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

        fetchMeasureUnits();
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
                onBlur={() => setTimeout(() => setIsFocused(false), 200)} // Скрываем после потери фокуса (timeout нужен для клика по списку)
            />

            {isFocused && results.length > 0 && ( // Показываем список только если есть фокус
                <ul style={styles.resultsList}>
                    {results.map((unit, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelect(unit)}
                            style={styles.resultItem}
                            onMouseEnter={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = '#fff')}
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
        width: '120px',
    },
    input: {
        color: 'black',
        width: '100px',
        padding: '8px',
        fontSize: '16px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: '#fff',
    },
    resultsList: {
        position: 'absolute',
        zIndex: 1000,
        width: '120px',
        maxHeight: '200px',
        overflowY: 'auto',
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginTop: '5px',
        padding: '0',
        listStyle: 'none',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    resultItem: {
        padding: '10px 12px',
        cursor: 'pointer',
        color: '#333',
        transition: 'background-color 0.2s ease',
    },
    loading: {
        padding: '8px',
        color: '#666',
        fontStyle: 'italic',
    },
};

export default MeasureUnitAutocomplete;
