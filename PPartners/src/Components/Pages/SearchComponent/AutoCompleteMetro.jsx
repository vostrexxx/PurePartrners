import React, { useState, useEffect, useRef } from "react";
import { Form } from "react-bootstrap";
import TextField from "@mui/material/TextField";

const MetroAutocomplete = ({ onSelect, value }) => {
    const [query, setQuery] = useState(value || "");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const containerRef = useRef(null);
    const url = localStorage.getItem("url");
    const authToken = localStorage.getItem("authToken");

    useEffect(() => {
        if (query.length === 0) {
            setResults([]);
            setShowSuggestions(false);
            return;
        }

        const fetchMetroSuggestions = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `${url}/announcement/metro/filter?query=${encodeURIComponent(query)}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${authToken}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Ошибка при загрузке данных");
                }

                const data = await response.json();
                const metros = data.metros || [];

                // Проверяем на полное совпадение (без учета регистра и пробелов)
                const isExactMatch = metros.some(metro =>
                    metro.toLowerCase().trim() === query.toLowerCase().trim()
                );

                setResults(metros);

                // Показываем подсказки только если нет полного совпадения и есть результаты
                if (!isExactMatch && metros.length > 0) {
                    setShowSuggestions(true);
                } else {
                    setShowSuggestions(false);
                }
            } catch (error) {
                console.error("Ошибка при загрузке метро:", error);
                setResults([]);
                setShowSuggestions(false);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchMetroSuggestions();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [query]);

    const handleSelect = (metro) => {
        setQuery(metro);
        onSelect(metro);
        setShowSuggestions(false);
        setResults([]);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div ref={containerRef} style={{ position: "relative" }}>
            <Form.Label>Станция метро</Form.Label>
            <TextField
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => {
                    if (query.length > 0 && results.length > 0) {
                        // Проверяем на полное совпадение при фокусе
                        const isExactMatch = results.some(metro =>
                            metro.toLowerCase().trim() === query.toLowerCase().trim()
                        );
                        if (!isExactMatch) {
                            setShowSuggestions(true);
                        }
                    }
                }}
                placeholder="Введите станцию метро"
                className="metro-input w-100"
                sx={{
                    "& .MuiInputBase-input": {
                        color: "black",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "black",
                    },
                    "& .MuiInputLabel-root": {
                        color: "black",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                        color: "black",
                    },
                }}
            />

            {showSuggestions && results.length > 0 && (
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
                    {results.map((metro, index) => (
                        <li
                            key={`metro-${index}`}
                            onClick={() => handleSelect(metro)}
                            style={{
                                padding: "8px",
                                cursor: "pointer",
                                color: "white",
                                transition: "background-color 0.2s",
                                borderBottom: index !== results.length - 1 ? "1px solid #555" : "none",
                            }}
                            onMouseEnter={(e) => (e.target.style.backgroundColor = "#444")}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                        >
                            {metro}
                        </li>
                    ))}
                </ul>
            )}

            {(loading && showSuggestions) && <div style={{ padding: "8px", color: "#bbb" }}>Загрузка...</div>}

            <style>
                {`
          .metro-input::placeholder {
            color: #bbb;
          }
        `}
            </style>
        </div>
    );
};

export default MetroAutocomplete;