// server.js
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Middleware для обработки POST-запроса
server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
  if (req.method === 'POST' && req.url === '/auth/checkPhoneNumber') {
    const { phoneNumber } = req.body;

    // Логика для проверки номера телефона
    if (phoneNumber === '+79164331768') {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } else {
    next(); // Передать управление следующему обработчику
  }
});

server.use(middlewares);
server.use(router);

// Запуск сервера
server.listen(8887, () => {
  console.log('JSON Server is running on http://localhost:8887');
});
