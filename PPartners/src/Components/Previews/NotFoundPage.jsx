import React from 'react';

const NotFoundPage = () => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      {/* Основной контент */}
      <div className="text-center">
        {/* Заголовок */}
        <h1 className="display-1 fw-bold text-primary">404</h1>
        <h2 className="mb-4">Страница не найдена</h2>

        {/* Подзаголовок */}
        <p className="lead mb-5">
          Извините, но запрашиваемая вами страница не существует.
        </p>

        {/* Кнопка "На главную" */}
        <a href="/" className="btn btn-primary btn-lg">
          Вернуться на главную
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;