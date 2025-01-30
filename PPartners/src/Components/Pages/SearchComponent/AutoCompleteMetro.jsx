import React, { useState, useEffect } from 'react';

const MetroAutocomplete = ({ onSelect, value }) => {
  const [query, setQuery] = useState(value || ''); // Текущий запрос
  const [results, setResults] = useState([]); // Результаты поиска
  const [loading, setLoading] = useState(false); // Состояние загрузки
  const url = localStorage.getItem('url');
  const getAuthToken = () => localStorage.getItem('authToken');
  // Отправляем запрос на сервер при изменении query
  useEffect(() => {
    if (query.length === 0) {
      setResults([]); // Очищаем результаты, если запрос пустой
      return;
    }

    const fetchMetroSuggestions = async () => {
      setLoading(true);
      try {
        // const response = await fetch(
        //   `${localStorage.getItem('url')}/announcement/metro/filter?query=${encodeURIComponent(query)}`
        // );

        const response = await fetch(`${url}/announcement/metro/filter?query=${encodeURIComponent(query)}`, {
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
        setResults(data.metros); // Устанавливаем результаты
      } catch (error) {
        console.error('Ошибка при загрузке метро:', error);
        setResults([]); // Очищаем результаты в случае ошибки
      } finally {
        setLoading(false);
      }
    };

    fetchMetroSuggestions();
  }, [query]); // Зависимость от query

  // Обработчик выбора станции
  const handleSelect = (metro) => {
    setQuery(metro); // Устанавливаем выбранное значение в поле ввода
    onSelect(metro); // Передаем выбранное значение в родительский компонент
    setResults([]); // Очищаем выпадающий список
  };

  // Стили
  const styles = {
    metroAutocomplete: {
      position: 'relative',
      marginBottom: '15px',
    },
    input: {
      width: '100%',
      padding: '8px',
      fontSize: '16px',
      border: '1px solid #ccc',
      borderRadius: '4px',
    },
    metroResults: {
      position: 'absolute',
      zIndex: 1000,
      width: '100%',
      maxHeight: '200px',
      overflowY: 'auto',
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: '4px',
      marginTop: '5px',
      padding: '0',
      listStyle: 'none',
    },
    resultItem: {
      padding: '8px 12px',
      cursor: 'pointer',
      color: 'black',
    },
    resultItemHover: {
      backgroundColor: '#f5f5f5',
    },
    loading: {
      padding: '8px',
      color: '#666',
      fontStyle: 'italic',
    },
  };

  return (
    <div style={styles.metroAutocomplete}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Введите станцию метро"
        style={styles.input}
      />

      {/* Выпадающий список с результатами */}
      {results.length > 0 && (
        <ul style={styles.metroResults}>
          {results.map((metro, index) => (
            <li
              key={index}
              onClick={() => handleSelect(metro)}
              style={styles.resultItem}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'white')}
            >
              {metro}
            </li>
          ))}
        </ul>
      )}

      {/* Индикатор загрузки */}
      {loading && <div style={styles.loading}>Загрузка...</div>}
    </div>
  );
};

export default MetroAutocomplete;