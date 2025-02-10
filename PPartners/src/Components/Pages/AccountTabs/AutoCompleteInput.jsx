import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";

const AutoCompleteInput = ({ name, placeholder, onCategorySelect }) => {
    const [inputValue, setInputValue] = useState("");
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const url = localStorage.getItem("url");
    const authToken = localStorage.getItem("authToken");

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
        <div style={{ position: "relative" }}>
            <Form.Label style={{ color: "white" }}>Ваша категория работ</Form.Label>
            <Form.Control
                type="text"
                name={name}
                placeholder={placeholder}
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setShowSuggestions(true)}
                style={{
                    backgroundColor: "#333",
                    color: "white",
                    border: "1px solid #555",
                }}
                className="autocomplete-input"
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
