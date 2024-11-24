import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';

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
            <Button variant="contained" color="primary" onClick={handleSearch}>
                Найти
            </Button>
        </div>
    );
};

export default SearchComponent;
