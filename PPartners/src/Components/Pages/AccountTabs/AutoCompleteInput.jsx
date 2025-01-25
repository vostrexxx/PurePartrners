import React, { useState, useEffect } from "react";

const AutoCompleteInput = ({ label, name, placeholder, onCategorySelect }) => {
    const [inputValue, setInputValue] = useState("");
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    // const [loading, setLoading] = useState(false);
    const url = localStorage.getItem("url");
    const authToken = localStorage.getItem("authToken");

    const fetchSearchSuggestions = async (query) => {
        // setLoading(true);
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
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        // При пустом поле ввода отправляем запрос без параметров
        if (inputValue.trim() === "") {
            fetchSearchSuggestions("");
        } else {
            const lastWord = inputValue.trim().split(" ").pop();
            fetchSearchSuggestions(lastWord);
            // console.log(lastWord)
        }
    }, [inputValue]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        onCategorySelect(value);
    };

    const replaceLastWord = (currentInput, newWord) => {
        const words = currentInput.trim().split(" ");
        words.pop(); // Удаляем последнее слово
        words.push(newWord); // Добавляем новое слово
        return words.join(" ") + " "; // Добавляем пробел в конце
    };

    const handleSearchSuggestionClick = (searchSuggestion) => {
        const updatedValue = replaceLastWord(inputValue, searchSuggestion);
        setInputValue(updatedValue);
        setSearchSuggestions([]);
        onCategorySelect(updatedValue); // Обновляем состояние в родительском компоненте
    };

    return (
        <div>
            <label>{label}</label>
            <input
                type="text"
                name={name}
                placeholder={placeholder}
                value={inputValue}
                onChange={handleInputChange}
            />
            {/* {loading && <p>Загрузка...</p>} */}
            <div style={{ border: "1px solid #ccc", padding: "8px", borderRadius: "4px" }}>
                {searchSuggestions.map((searchSuggestion, index) => (
                    <div
                        key={`searchSuggestion-${index}`}
                        style={{
                            padding: "8px",
                            cursor: "pointer",
                            borderBottom: index !== searchSuggestions.length - 1 ? "1px solid #ddd" : "none",
                        }}
                        onClick={() => handleSearchSuggestionClick(searchSuggestion)}
                    >
                        {searchSuggestion}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AutoCompleteInput;
