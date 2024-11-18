import React, { useEffect, useState } from 'react';
import { Switch, Drawer, Button, TextField, Checkbox, FormControlLabel, Slider, Radio, RadioGroup, FormControl, FormLabel } from '@mui/material';
import { useProfile } from '../../Context/ProfileContext';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Card from '../../Previews/Card';
import SearchComponent from '../SearchComponent/SearchComponent';

const MainPage = () => {
    const { isSpecialist, toggleProfile } = useProfile();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [questionnaires, setQuestionnaires] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filterParams, setFilterParams] = useState({
        minPrice: 0,
        maxPrice: 100000,
        experience: 0,
        totalCost: [0, 500000],
        startDate: null,
        finishDate: null,
        hasTeam: 'any', // "any" (по умолчанию), "yes", или "no"
        hasEdu: false,
        hasOther: false,
        categoriesOfWork: ''
    });
    const [appliedFilters, setAppliedFilters] = useState({ ...filterParams });
    let url = localStorage.getItem('url');
    const getAuthToken = () => localStorage.getItem('authToken');

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
    const toggleFilterDrawer = () => setIsFilterOpen(!isFilterOpen);

    const handleSearch = async (searchText) => {
        setLoading(true);
    
        try {
            let response;
            const params = new URLSearchParams();
    
            params.append('text', searchText || '');

    
            if (appliedFilters.hasEdu) params.append('hasEdu', '1');
            if (appliedFilters.minPrice !== 0) params.append('minPrice', appliedFilters.minPrice);
            if (appliedFilters.maxPrice !== 100000) params.append('maxPrice', appliedFilters.maxPrice);
            if (appliedFilters.experience !== 0) params.append('minWorkExp', appliedFilters.experience);

            // Обрабатываем фильтр hasTeam
            if (appliedFilters.hasTeam === 'yes') params.append('hasTeam', 'true');
            if (appliedFilters.hasTeam === 'no') params.append('hasTeam', 'false');

            if (!isSpecialist) {
                if (appliedFilters.hasOther) params.append('hasOther', '1');
                if (appliedFilters.startDate) params.append('startDate', appliedFilters.startDate.toISOString());
                if (appliedFilters.finishDate) params.append('finishDate', appliedFilters.finishDate.toISOString());
                if (appliedFilters.totalCost[0] !== 0 || appliedFilters.totalCost[1] !== 500000) {
                    params.append('totalCost', appliedFilters.totalCost);
                }
            }
    
            const urlWithParams = isSpecialist
                ? `${url}/questionnaire/filter?${params.toString()}`
                : `${url}/announcement/filter?${params.toString()}`;
    
            response = await fetch(urlWithParams, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`,
                },
            });
    
            const data = await response.json();
            if (isSpecialist) {
                setQuestionnaires(data.previews);
                // console.log(questionnaires)
            } else {
                setAnnouncements(data.previews);
                // console.log(announcements)
                
            }
        } catch (error) {
            setError('Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e, newValue) => {
        const { name, type, checked, value } = e.target || {};
        setFilterParams({
            ...filterParams,
            [name]: type === 'checkbox' ? checked : newValue || value
        });
    };

    const handleHasTeamChange = (event) => {
        setFilterParams({
            ...filterParams,
            hasTeam: event.target.value,
        });
    };

    const applyFilters = () => {
        setAppliedFilters(filterParams);
        toggleFilterDrawer();
    };

    const submitFilters = () => {
        handleSearch(filterParams.categoriesOfWork);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
    
            try {
                let response;
                const params = new URLSearchParams({ text: "" });
    
                if (isSpecialist) {
                    response = await fetch(`${url}/questionnaire/filter?${params.toString()}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getAuthToken()}`,
                        }
                    });
                    const data = await response.json();
                    setQuestionnaires(data.previews || []);
                } else {
                    response = await fetch(`${url}/announcement/filter?${params.toString()}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getAuthToken()}`,
                        }
                    });
                    const data = await response.json();
                    setAnnouncements(data.previews || []);
                }
            } catch (error) {
                setError('Ошибка загрузки данных');
            } finally {
                setLoading(false);
            }
        };
    
        // Проверка на пустые массивы, чтобы предотвратить повторную загрузку данных
        if (isSpecialist && questionnaires.length === 0) {
            fetchData();
        } else if (!isSpecialist && announcements.length === 0) {
            fetchData();
        }
    }, [isSpecialist]);
    
    

    return (
        <div>
            <div style={styles.topBar}>
                <div style={styles.topBarContent}>
                    <div style={styles.profileContainer}>
                        <FaUserCircle size={30} style={styles.profileIcon} onClick={toggleDropdown} />
                        {dropdownOpen && (
                            <div style={styles.dropdownMenu}>
                                <ul style={styles.dropdownList}>
                                    <li style={styles.dropdownItem} onClick={() => navigate('/account-actions')}>Работа с аккаунтом</li>
                                </ul>
                                <ul style={styles.dropdownList}>
                                    <li style={styles.dropdownItem} onClick={() => navigate('/agreement')}>Отклики</li>
                                </ul>
                            </div>
                        )}
                        <div style={styles.profileSwitchContainer}>
                            <span>Заказчик</span>
                            <Switch checked={isSpecialist} onChange={toggleProfile} color="primary" />
                            <span>Специалист</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={styles.mainContent}>
                {isSpecialist ? <div>Интерфейс Специалиста</div> : <div>Интерфейс Заказчика</div>}
            </div>

            <div style={{ marginTop: '20px' }}>
                <SearchComponent onSearch={handleSearch} />
                <Button variant="outlined" onClick={toggleFilterDrawer} style={{ marginTop: '20px' }}>
                    Фильтры
                </Button>
            </div>

            <Drawer anchor="right" open={isFilterOpen} onClose={toggleFilterDrawer}>
                <div style={{ width: '300px', padding: '20px' }}>
                    <h3>Фильтры</h3>

                    {isSpecialist ? (
                        <>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Имеется ли команда?</FormLabel>
                                <RadioGroup
                                    name="hasTeam"
                                    value={filterParams.hasTeam}
                                    onChange={handleHasTeamChange}
                                >
                                    <FormControlLabel value="any" control={<Radio />} label="Неважно" />
                                    <FormControlLabel value="yes" control={<Radio />} label="Да" />
                                    <FormControlLabel value="no" control={<Radio />} label="Нет" />
                                </RadioGroup>
                            </FormControl>

                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={filterParams.hasEdu}
                                        onChange={handleFilterChange}
                                        name="hasEdu"
                                    />
                                }
                                label="Есть образование"
                            />
                            <h5>Минимальная опыт работы в годах</h5>
                            <Slider
                                value={filterParams.experience}
                                onChange={(e, newValue) => handleFilterChange(e, newValue)}
                                valueLabelDisplay="auto"
                                min={0}
                                max={50}
                                name="experience"
                                label="Опыт работы (лет)"
                            /> 
                            <h5>Минимальная цена</h5>
                            <Slider
                                value={filterParams.minPrice}
                                onChange={(e, newValue) => handleFilterChange(e, newValue)}
                                valueLabelDisplay="auto"
                                min={0}
                                max={100000}
                                name="minPrice"
                                label="Минимальная цена"
                            />
                        </>
                    ) : (
                        <>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Дата начала"
                                    value={filterParams.startDate}
                                    onChange={(date) => handleFilterChange({ target: { name: 'startDate', value: date } })}
                                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                                />
                                <DatePicker
                                    label="Дата окончания"
                                    value={filterParams.finishDate}
                                    onChange={(date) => handleFilterChange({ target: { name: 'finishDate', value: date } })}
                                    renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                                />
                            </LocalizationProvider>
                            
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={filterParams.hasOther}
                                        onChange={handleFilterChange}
                                        name="hasOther"
                                    />
                                }
                                label="Дополнительные условия"
                            />
                            <h5>Общая стоимость</h5>
                            <Slider
                                value={filterParams.totalCost}
                                onChange={(e, newValue) => handleFilterChange(e, newValue)}
                                valueLabelDisplay="auto"
                                min={0}
                                max={500000}
                                name="totalCost"
                                label="Общая стоимость"
                            />
                        </>
                    )}

                    <Button variant="contained" color="primary" onClick={applyFilters} fullWidth>
                        Применить фильтры
                    </Button>
                </div>
            </Drawer>

            <div>
                {!isSpecialist ? (
                    <div>
                        <h2>Ваши анкеты</h2>
                        {questionnaires.length > 0 ? (
                            questionnaires.map((item) => (
                                <Card
                                    title={item.categoriesOfWork}
                                    onClick={() => navigate(`/questionnaire/${item.id}`, { state: { fromLk: false } })}
                                    key={item.id}
                                />
                            ))
                        ) : (
                            <p>Нет анкет</p>
                        )}
                    </div>
                ) : (
                    <div>
                        <h2>Объявления</h2>
                        {announcements.length > 0 ? (
                            announcements.map((item) => (
                                <Card
                                    title={item.workCategories}
                                    onClick={() => navigate(`/announcement/${item.id}`, { state: { fromLk: false } })}
                                    key={item.id}
                                />
                            ))
                        ) : (
                            <p>Нет объявлений</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    topBar: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '5%',
        width: '100%',
        padding: '0 20px',
        backgroundColor: '#f8f8f8',
        borderBottom: '1px solid #ddd',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
    },
    topBarContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: '1200px',
    },
    profileContainer: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    profileIcon: {
        cursor: 'pointer',
        color: '#333',
    },
    dropdownMenu: {
        position: 'absolute',
        top: '35px',
        right: 0,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
        borderRadius: '4px',
        zIndex: 1000,
        minWidth: '150px',
        visibility: 'visible',
        opacity: 1,
        transition: 'opacity 0.3s ease',
    },
    dropdownList: {
        listStyle: 'none',
        padding: '0',
        margin: '0',
    },
    dropdownItem: {
        padding: '10px 20px',
        cursor: 'pointer',
        backgroundColor: 'black',
        color: 'white',
    },
    profileSwitchContainer: {
        display: 'flex',
        alignItems: 'center',
        color: 'black',
        marginLeft: '20px',
    },
    mainContent: {
        padding: '70px 20px 20px',
    },
};

export default MainPage;
