import React, { useEffect, useState } from 'react';
import { Switch, Drawer, TextField, Checkbox, FormControlLabel, Slider, Radio, RadioGroup, FormControl, FormLabel } from '@mui/material';
import { useProfile } from '../../Context/ProfileContext';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import Card from '../../Previews/Card';
import SearchComponent from '../SearchComponent/SearchComponent';
import TopBar from '../TopBar/TopBar';
import ErrorMessage from '../../ErrorHandling/ErrorMessage';
import { Container, Row, Col, Nav, Button, Tab } from "react-bootstrap";

const MainPage = () => {
    const { isSpecialist, toggleProfile } = useProfile();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [questionnaires, setQuestionnaires] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cardsError, setCardsError] = useState(null);
    const [filterParams, setFilterParams] = useState({
        minPrice: 0,
        maxPrice: 10000000,
        experience: 0,
        totalCost: [0, 10000000],
        startDate: null,
        finishDate: null,
        hasTeam: 'any', // "any" (по умолчанию), "yes", или "no"
        hasEdu: false,
        isNonFixedPrice: false,
        workCategories: ''
    });
    const [appliedFilters, setAppliedFilters] = useState({ ...filterParams });
    let url = localStorage.getItem('url');
    const getAuthToken = () => localStorage.getItem('authToken');

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
    const toggleFilterDrawer = () => setIsFilterOpen(!isFilterOpen);

    const handleSearch = async (searchText) => {
        setLoading(true);

        try {
            const params = new URLSearchParams();

            // Поисковый текст
            params.append('text', searchText || '');

            // Общая стоимость: разбиваем на minPrice и maxPrice
            if (appliedFilters.totalCost && appliedFilters.totalCost.length === 2) {
                params.append('minPrice', appliedFilters.totalCost[0]);
                params.append('maxPrice', appliedFilters.totalCost[1]);
            }

            // Минимальная и максимальная цена
            if (appliedFilters.minPrice > 0) {
                params.append('minPrice', appliedFilters.minPrice);
            }
            if (appliedFilters.maxPrice < 100000) {
                params.append('maxPrice', appliedFilters.maxPrice);
            }

            // Опыт работы
            if (appliedFilters.experience > 0) {
                params.append('minWorkExp', appliedFilters.experience);
            }

            // Фильтр "Есть образование"
            if (appliedFilters.hasEdu) {
                params.append('hasEdu', 'true');
            }

            // Фильтр команды
            if (appliedFilters.hasTeam === 'yes') {
                params.append('hasTeam', 'true');
            }
            if (appliedFilters.hasTeam === 'no') {
                params.append('hasTeam', 'false');
            }

            // Если пользователь не специалист
            // if (!isSpecialist) {
            if (appliedFilters.isNonFixedPrice) {
                params.append('isNonFixedPrice', '1');
            }
            if (appliedFilters.startDate) {
                params.append('startDate', formatDate(appliedFilters.startDate));
            }
            if (appliedFilters.finishDate) {
                params.append('finishDate', formatDate(appliedFilters.finishDate));
            }

            // }

            // Формируем URL с параметрами
            const urlWithParams = isSpecialist
                ? `${url}/announcement/filter?${params.toString()}`
                : `${url}/questionnaire/filter?${params.toString()}`;

            // Выполняем запрос
            const response = await fetch(urlWithParams, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getAuthToken()}`,
                },
            });

            const data = await response.json();

            // Обновляем состояние на основе роли пользователя
            if (isSpecialist) {
                setAnnouncements(data.previews || []);
            } else {
                setQuestionnaires(data.previews || []);
            }
        } catch (error) {
            setCardsError('Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        return format(date, 'yyyy-MM-dd');
    };


    const handleFilterChange = (e, newValue) => {
        const { name, type, checked, value } = e.target || {};
        setFilterParams({
            ...filterParams,
            [name]: type === 'checkbox' ? checked : newValue || value
        });
    };

    const handleDateChange = (name, date) => {
        setFilterParams((prev) => ({
            ...prev,
            [name]: date, // Сохраняем дату в состояние
        }));
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
        handleSearch(filterParams.workCategories);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setCardsError(null);
            try {
                let response;
                const params = new URLSearchParams({ text: "" });

                if (isSpecialist) {
                    response = await fetch(`${url}/announcement/filter?${params.toString()}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getAuthToken()}`,
                        },
                    });
                } else {
                    response = await fetch(`${url}/questionnaire/filter?${params.toString()}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getAuthToken()}`,
                        },
                    });
                }

                if (!response.ok) {
                    const errorText = await response.text();

                    try {
                        const errorData = JSON.parse(errorText);
                        throw new Error(errorData.message || `Ошибка ${response.status}`);
                    } catch (parseError) {

                        throw new Error(errorText || `Ошибка ${response.status}`);
                    }
                }

                const data = await response.json();
                if (isSpecialist) {
                    setAnnouncements(data.previews || []);
                } else {
                    setQuestionnaires(data.previews || []);
                }
            } catch (error) {
                setCardsError(error.message);
                console.error('Произошла ошибка:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isSpecialist]);


    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <TopBar />
            <Container
                fluid
                style={{
                    backgroundColor: "#242582",
                    flex: 1,
                    padding: "20px",
                }}
            >
                <Row className="justify-content-center">
                    <Col xs={12} md={10} lg={8}>

                        {/* <div style={styles.mainContent}> */}
                        <h2 className="text-white">{isSpecialist ? "Поиск объявлений" : "Поиск анкет"} w</h2>
                        {/* </div> */}

                        <ErrorMessage message={cardsError} errorCode={null} />

                        <div className='mb-3'>
                            <SearchComponent onSearch={handleSearch} />
                            <Button
                                variant="primary"
                                className="w-100 mt-3"
                                onClick={toggleFilterDrawer}

                            >
                                Фильтры 🔍
                            </Button>
                        </div>

                        <Drawer anchor="right" open={isFilterOpen} onClose={toggleFilterDrawer}>
                            <div style={{ width: '300px', padding: '20px' }}>
                                <h3>Фильтры</h3>

                                {!isSpecialist ? (
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
                                            label="Имеется профильное образование"
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
                                            max={10000000}
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
                                                onChange={(date) => handleDateChange('startDate', date)}
                                                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                                            />
                                            <DatePicker
                                                label="Дата окончания"
                                                value={filterParams.finishDate}
                                                onChange={(date) => handleDateChange('finishDate', date)}
                                                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                                            />

                                        </LocalizationProvider>

                                        <h5>Общая стоимость</h5>
                                        <Slider
                                            value={filterParams.totalCost}
                                            onChange={(e, newValue) => handleFilterChange(e, newValue)}
                                            valueLabelDisplay="auto"
                                            min={0}
                                            max={10000000}
                                            name="totalCost"
                                            label="Общая стоимость"
                                        />
                                    </>
                                )}

                                <Button color="primary" onClick={applyFilters} fullWidth>
                                    Применить фильтры
                                </Button>
                            </div>
                        </Drawer>

                        <div>
                            {!isSpecialist ? (
                                <div>
                                    {/* <h2 className="w-100 mt-3 text-white" >Анкеты:</h2> */}
                                    {questionnaires.length > 0 ? (
                                        questionnaires.map((item) => (
                                            <Card
                                                title={item.workCategories}
                                                onClick={() => navigate(`/questionnaire/${item.id}`, { state: { fromLk: false } })}
                                                key={item.id}

                                                totalCost={item.totalCost}
                                                address={item.address}
                                                workExp={item.workExp}
                                                hasTeam={item.hasTeam}
                                                hasEdu={item.hasEdu}
                                                // onClick={() => navigate(`/${type}/${data.id}`, { state: { fromLk: null } })}
                                                type={"questionnaire"}
                                            />
                                        ))
                                    ) : (
                                        <p>Нет анкет</p>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    {/* <h2>Объявления:</h2> */}
                                    {announcements.length > 0 ? (
                                        announcements.map((item) => (
                                            <Card
                                                title={item.workCategories}
                                                onClick={() => navigate(`/announcement/${item.id}`, { state: { fromLk: false } })}
                                                key={item.id}
                                                totalCost={item.totalCost}
                                                address={item.address}
                                                workExp={item.workExp}
                                                hasTeam={item.hasTeam}
                                                hasEdu={item.hasEdu}
                                                // onClick={() => navigate(`/${type}/${data.id}`, { state: { fromLk: null } })}
                                                type={"announcement"}
                                            />
                                        ))
                                    ) : (
                                        <p>Нет объявлений</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>


            </Container >
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
        // padding: '70px 20px 20px',
    },
};

export default MainPage;
