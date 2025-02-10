import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";

const MetroAutocomplete = ({ onSelect, value }) => {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const url = localStorage.getItem("url");
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    if (query.length === 0) {
      setResults([]);
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
        setResults(data.metros || []);
      } catch (error) {
        console.error("Ошибка при загрузке метро:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMetroSuggestions();
  }, [query]);

  const handleSelect = (metro) => {
    setQuery(metro);
    onSelect(metro);
    setResults([]);
  };

  return (
    <div style={{ position: "relative" }}>
      <Form.Label style={{ color: "white" }}>Станция метро</Form.Label>
      <Form.Control
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Введите станцию метро"
        style={{
          backgroundColor: "#333",
          color: "white",
          border: "1px solid #555",
        }}
        className="metro-input"
      />

      {results.length > 0 && (
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

      {loading && <div style={{ padding: "8px", color: "#bbb" }}>Загрузка...</div>}

      {/* Стили для серого плейсхолдера */}
      <style>
        {`
          .metro-input::placeholder {
            color: #bbb; /* Серый цвет для плейсхолдера */
          }
        `}
      </style>
    </div>
  );
};

export default MetroAutocomplete;
