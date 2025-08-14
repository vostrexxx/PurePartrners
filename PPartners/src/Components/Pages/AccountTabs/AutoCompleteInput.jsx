import React, { useState, useEffect, useRef } from "react";
import { Form } from "react-bootstrap";
import TextField from "@mui/material/TextField";

const AutoCompleteInput = ({ name, placeholder, onCategorySelect }) => {
    const [inputValue, setInputValue] = useState("");
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const url = localStorage.getItem("url");
    const authToken = localStorage.getItem("authToken");

    // Создаем ref для контейнера
    const containerRef = useRef(null);

    const fetchSearchSuggestions = async (query) => {
        try {
            const response = await fetch(`${url}/categories/search${query ? `?searchText=${query}` : ""}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setSearchSuggestions(data.searchResult || []);
            } else {
                console.error("Ошибка при поиске категорий");
            }
        } catch (error) {
            console.error("Произошла ошибка при поиске:", error);
        }
    };

    useEffect(() => {
        if (inputValue.trim() === "") {
            setShowSuggestions(false);
        } else {
            const lastWord = inputValue.trim().split(" ").pop();
            fetchSearchSuggestions(lastWord);
            setShowSuggestions(true);
        }
    }, [inputValue]);

    // Эффект для обработки кликов вне компонента
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        // Добавляем обработчик клика на документ
        document.addEventListener("mousedown", handleClickOutside);

        // Убираем обработчик при размонтировании
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        onCategorySelect(value);
    };

    const replaceLastWord = (currentInput, newWord) => {
        const words = currentInput.trim().split(" ");
        words.pop();
        words.push(newWord);
        return words.join(" ") + " ";
    };

    const handleSearchSuggestionClick = (searchSuggestion) => {
        const updatedValue = replaceLastWord(inputValue, searchSuggestion);
        setInputValue(updatedValue);
        setSearchSuggestions([]);
        setShowSuggestions(false);
        onCategorySelect(updatedValue);
    };

    return (
        <div ref={containerRef} style={{ position: "relative" }}>
            <Form.Label style={{ color: "black" }}>Ваша категория работ</Form.Label>
            <TextField
                type="text"
                name={name}
                placeholder={placeholder}
                value={inputValue}
                multiline
                minRows={2}
                maxRows={5}
                onChange={handleInputChange}
                onFocus={() => {
                    if (inputValue.trim() !== "") {
                        setShowSuggestions(true);
                    }
                }}
                className="autocomplete-input w-100"
                // sx={{
                //     "& .MuiInputBase-input": {
                //         color: "black",
                //     },
                //     "& .MuiOutlinedInput-notchedOutline": {
                //         borderColor: "black",
                //     },
                //     "& .MuiInputLabel-root": {
                //         color: "black",
                //     },
                //     "& .MuiInputLabel-root.Mui-focused": {
                //         color: "black",
                //     },
                // }}
            />
            <style>
                {`
                .autocomplete-input::placeholder {
                    color: #bbb;
                }
                `}
            </style>
            {showSuggestions && searchSuggestions.length > 0 && (
                <ul
                    style={{
                        position: "absolute",
                        width: "100%",
                        backgroundColor: "#333",
                        border: "1px solid #555",
                        borderRadius: "4px",
                        padding: "8px 0",
                        margin: "4px 0 0 0",
                        listStyleType: "none",
                        zIndex: 1000,
                        maxHeight: "200px",
                        overflowY: "auto",
                    }}
                >
                    {searchSuggestions.map((searchSuggestion, index) => (
                        <li
                            key={`searchSuggestion-${index}`}
                            style={{
                                padding: "8px",
                                color: "white",
                                cursor: "pointer",
                                transition: "background-color 0.2s",
                                borderBottom: index !== searchSuggestions.length - 1 ? "1px solid #555" : "none",
                            }}
                            onClick={() => handleSearchSuggestionClick(searchSuggestion)}
                            onMouseEnter={(e) => (e.target.style.backgroundColor = "#444")}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                        >
                            {searchSuggestion}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AutoCompleteInput;