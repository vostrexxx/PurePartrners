import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from "react-bootstrap";

const SearchComponent = ({ onSearch }) => {
    const [searchText, setSearchText] = useState('');

    const handleSearch = () => {
        onSearch(searchText); // Передаем текст поиска обратно в MainPage
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Form.Control
                type="text"
                placeholder="Категория работ"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ flexGrow: 1 }}
            />
            <Button variant="primary" onClick={handleSearch}>
                Найти
            </Button>
        </div>
    );
};

export default SearchComponent;