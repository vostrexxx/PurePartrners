import React, {useEffect, useState} from 'react';
import { Autocomplete, TextField } from '@mui/material';

// Исправленная деструктуризация пропсов
const MultipleAutocomplete = ({ notUsedRawStages, setSubStages }) => {
    const [selectedOptions, setSelectedOptions] = useState([]);

    useEffect(() => {
        console.log('notUsedRawStages', notUsedRawStages);
    }, [notUsedRawStages]);

    return (
        <Autocomplete
            disableCloseOnSelect
            multiple
            options={notUsedRawStages || []}
            getOptionLabel={(option) => option.subWorkCategoryName || ''}
            getOptionKey={(option) => option.elementId}
            value={selectedOptions}
            onChange={(event, newValue) => {
                setSelectedOptions(newValue);
                setSubStages(newValue);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    label="Выберите этапы"
                    placeholder="Выберите..."
                />
            )}
        />
    );
};

export default MultipleAutocomplete;