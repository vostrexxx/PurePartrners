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
import { Container, Row, Col, Nav, Button, Tab, Form } from "react-bootstrap";

const MainPage = () => {
    const { isSpecialist, toggleProfile } = useProfile();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [questionnaires, setQuestionnaires] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cardsError, setCardsError] = useState(null);



    let url = localStorage.getItem('url');
    const getAuthToken = () => localStorage.getItem('authToken');

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
    const toggleFilterDrawer = () => setIsFilterOpen(!isFilterOpen);


    // Состояние для применённых фильтров
    const [appliedQuestionnaireFilters, setAppliedQuestionnaireFilters] = useState({});
    const [appliedAnnouncementFilters, setAppliedAnnouncementFilters] = useState({});

    // Применение фильтров для анкет
    const applyQuestionnaireFilters = () => {
        setAppliedQuestionnaireFilters(questionnaireFilterParams);
        toggleFilterDrawer(); // Закрыть drawer (если используется)
    };

    // Применение фильтров для объявлений
    const applyAnnouncementFilters = () => {
        setAppliedAnnouncementFilters(announcementParams);
        toggleFilterDrawer(); // Закрыть drawer (если используется)
    };
    // const [appliedFilters, setAppliedFilters] = useState({ ...filterParams });


    const handleSearch = async (searchText) => {
        setLoading(true);

        try {
            const params = new URLSearchParams();

            // Поисковый текст
            params.append('text', searchText || '');

            // Если это запрос для анкет
            if (!isSpecialist) {
                // Фильтры для анкет
                if (appliedQuestionnaireFilters.minPrice) {
                    params.append('minPrice', appliedQuestionnaireFilters.minPrice);
                }
                if (appliedQuestionnaireFilters.experience) {
                    params.append('minWorkExp', appliedQuestionnaireFilters.experience);
                }
                if (appliedQuestionnaireFilters.hasEdu) {
                    params.append('hasEdu', 'true');
                }
                if (appliedQuestionnaireFilters.hasTeam === 'yes') {
                    params.append('hasTeam', 'true');
                }
                if (appliedQuestionnaireFilters.hasTeam === 'no') {
                    params.append('hasTeam', 'false');
                }
            }

            // Если это запрос для объявлений
            if (isSpecialist) {
                // Фильтры для объявлений
                if (appliedAnnouncementFilters.minCost) {
                    params.append('minCost', appliedAnnouncementFilters.minCost);
                }
                if (appliedAnnouncementFilters.maxCost) {
                    params.append('maxCost', appliedAnnouncementFilters.maxCost);
                }
                if (appliedAnnouncementFilters.startDate) {
                    params.append('startDate', formatDate(appliedAnnouncementFilters.startDate));
                }
                if (appliedAnnouncementFilters.finishDate) {
                    params.append('finishDate', formatDate(appliedAnnouncementFilters.finishDate));
                }
            }

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


    const handleFilterChange = (key, value) => {
        setFilterParams({
            ...filterParams,
            [key]: value
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
        if (!isSpecialist) {
            setAppliedQuestionnaireFilters(questionnaireFilterParams); // Применяем фильтры для анкет
        } else {
            setAppliedAnnouncementFilters(announcementParams); // Применяем фильтры для объявлений
        }
        toggleFilterDrawer(); // Закрываем drawer
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


    // const [filterParams, setFilterParams] = useState({
    //     hasTeam: 'any',
    //     hasEdu: false,
    //     experience: 0,
    //     minPrice: 0,
    // });

    // const handleHasTeamChange = (event) => {
    //     setFilterParams({ ...filterParams, hasTeam: event.target.value });
    // };

    // const handleFilterChange = (name, value) => {
    //     setFilterParams({ ...filterParams, [name]: value });
    // };

    // Вспомогательный компонент для группировки фильтров

    const [questionnaireFilterParams, setQuestionnaireFilterParams] = useState({
        minPrice: "",
        experience: "",
        hasTeam: 'any',
        hasEdu: false
    });

    const handleQuestionnaireFilterChange = (key, value) => {
        setQuestionnaireFilterParams(prevState => ({
            ...prevState,
            [key]: value
        }));
    };

    const handleQuestionnaireHasTeamChange = (e) => {
        handleQuestionnaireFilterChange('hasTeam', e.target.value);
    };



    const [announcementParams, setAnnouncementFilterParams] = useState({
        startDate: null, // Начальная дата
        finishDate: null, // Конечная дата
        minCost: '', // Минимальная стоимость
        maxCost: '', // Максимальная стоимость
    });

    // Обработка изменения даты
    const handleAnnouncementDateChange = (key, date) => {
        setAnnouncementFilterParams(prevState => ({
            ...prevState,
            [key]: date,
        }));
    };

    // Обработка изменения текстовых полей (стоимость)
    const handleAnnouncementCostChange = (e) => {
        const { name, value } = e.target;
        setAnnouncementFilterParams(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

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
                        <h2 className="text-white">{isSpecialist ? "Поиск объявлений" : "Поиск анкет"}</h2>
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
                                <h2>Фильтры</h2>
                                {!isSpecialist ? (
                                    <div>
                                        {/* Команда */}
                                        <div>
                                            <h5>Имеется ли команда?</h5>
                                            <FormControl component="fieldset">
                                                <RadioGroup
                                                    name="hasTeam"
                                                    value={questionnaireFilterParams.hasTeam}
                                                    onChange={handleQuestionnaireHasTeamChange}
                                                >
                                                    <FormControlLabel value="any" control={<Radio />} label="Неважно" />
                                                    <FormControlLabel value="yes" control={<Radio />} label="Да" />
                                                    <FormControlLabel value="no" control={<Radio />} label="Нет" />
                                                </RadioGroup>
                                            </FormControl>
                                        </div>

                                        {/* Профильное образование */}
                                        <div>
                                            <h5>Имеется ли профильное образование?</h5>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={questionnaireFilterParams.hasEdu}
                                                        onChange={(e) => handleQuestionnaireFilterChange('hasEdu', e.target.checked)}
                                                        name="hasEdu"
                                                    />
                                                }
                                                label="Имеется профильное образование"
                                            />
                                        </div>

                                        {/* Минимальный опыт работы */}
                                        <div>
                                            <h5>Минимальный опыт работы (лет)</h5>
                                            <Row className="align-items-center">
                                                <Col xs={12}>
                                                    <Form.Control
                                                        type="number"
                                                        value={questionnaireFilterParams.experience}
                                                        onChange={(e) => {
                                                            const value = e.target.value; // Сохраняем как строку
                                                            handleQuestionnaireFilterChange('experience', value);
                                                        }}
                                                        min={0}
                                                        max={50}
                                                        style={{ width: '150px' }}
                                                    />
                                                </Col>
                                            </Row>
                                        </div>

                                        {/* Минимальная цена */}
                                        <div
                                            hidden="true">
                                            <h5>Минимальная цена</h5>
                                            <Row className="align-items-center">
                                                <Col xs={12}>
                                                    <Form.Control
                                                        type="number"
                                                        value={questionnaireFilterParams.minPrice}
                                                        onChange={(e) => {
                                                            const value = e.target.value; // Сохраняем как строку
                                                            handleQuestionnaireFilterChange('minPrice', value);
                                                        }}
                                                        style={{ width: '150px' }}
                                                    />
                                                </Col>
                                            </Row>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        {/* Фильтры по дате */}
                                        <h5>Даты проведения работ</h5>
                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                            <DatePicker
                                                label="Дата начала"
                                                value={announcementParams.startDate}
                                                onChange={(date) => handleAnnouncementDateChange('startDate', date)}
                                                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                                                className='mb-2'
                                            />
                                            <DatePicker
                                                label="Дата окончания"
                                                value={announcementParams.finishDate}
                                                onChange={(date) => handleAnnouncementDateChange('finishDate', date)}
                                                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                                            />
                                        </LocalizationProvider>

                                        {/* Фильтр по стоимости (от и до) */}
                                        <h5>Общая стоимость</h5>
                                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                            <TextField
                                                label="От"
                                                name="minCost"
                                                value={announcementParams.minCost}
                                                onChange={handleAnnouncementCostChange}
                                                type="number"
                                                fullWidth
                                                margin="normal"
                                                sx={{
                                                    "& input[type='number']": {
                                                        MozAppearance: "textfield", // Для Firefox
                                                    },
                                                    "& input[type='number']::-webkit-inner-spin-button, & input[type='number']::-webkit-outer-spin-button": {
                                                        WebkitAppearance: "none", // Для Chrome и Safari
                                                        margin: 0,
                                                    },
                                                }}
                                            />
                                            <span>-</span>
                                            <TextField
                                                label="До"
                                                name="maxCost"
                                                value={announcementParams.maxCost}
                                                onChange={handleAnnouncementCostChange}
                                                type="number"
                                                fullWidth
                                                margin="normal"
                                                sx={{
                                                    "& input[type='number']": {
                                                        MozAppearance: "textfield", // Для Firefox
                                                    },
                                                    "& input[type='number']::-webkit-inner-spin-button, & input[type='number']::-webkit-outer-spin-button": {
                                                        WebkitAppearance: "none", // Для Chrome и Safari
                                                        margin: 0,
                                                    },
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <Button color="primary" onClick={applyFilters} fullWidth>
                                    Применить
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
                                        <p className='text-white text-center'>Нет анкет, удовлетворяюищих вашему запросу</p>
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
                                        <p className='text-white text-center'>Нет объявлений, удовлетворяюищих вашему запросу</p>
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
