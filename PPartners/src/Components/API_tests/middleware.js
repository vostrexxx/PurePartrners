// middleware.js
module.exports = (req, res, next) => {
    if (req.method === 'POST' && req.url === '/auth/checkPhoneNumber') {
      const { phoneNumber } = req.body;
  
      // Логика для проверки номера телефона
      if (phoneNumber === '+00000000') {
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    } else {
      next(); // Передать управление следующему обработчику
    }
  };
  