import React, { useState } from 'react';
import { TextField, } from '@mui/material';
import { Container, Row, Col, Form, Button, Card, ListGroup } from "react-bootstrap";
const SearchComponent = ({ onSearch }) => {
    const [searchText, setSearchText] = useState('');

    const handleSearch = () => {
        onSearch(searchText); // Передаем текст поиска обратно в MainPage
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TextField
                label="Поиск"
                variant="outlined"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ flexGrow: 1 }}
            />
            <Button variant="primary" color="primary" onClick={handleSearch}>
                Найти
            </Button>
        </div>
    );
};

export default SearchComponent;
