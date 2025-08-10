import firebase from 'firebase/app';
import 'firebase/messaging';

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBt7qptml6nCB5TP8ovrgOSMdWLzfQrcNA",
  authDomain: "partners-48847.firebaseapp.com",
  projectId: "partners-48847",
  storageBucket: "partners-48847.firebasestorage.app",
  messagingSenderId: "439292868437",
  appId: "1:439292868437:web:4a9d881bd8810668f4a1dc",
  measurementId: "G-SWTJS6B3TH",
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);

// Инициализация Firebase Messaging
const messaging = firebase.messaging();

/**
 * Запрос разрешения на уведомления и получение FCM токена.
 * @returns {Promise<string | undefined>} Токен FCM или undefined в случае ошибки.
 */
export const requestPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await messaging.getToken();
      // console.log('FCM Token:', token);

      // Отправляем токен на бэкенд
      await sendTokenToServer(token);

      return token;
    } else {
      console.warn('Разрешение на уведомления отклонено.');
    }
  } catch (error) {
    console.error('Ошибка при запросе разрешения:', error);
  }
};

/**
 * Отправка токена FCM на бэкенд.
 * @param {string} token - Токен FCM.
 */
/**
 * Отправка токена FCM на бэкенд.
 * @param {string} token - Токен FCM.
 */
export const sendTokenToServer = async (token) => {
  try {
    const response = await fetch('https://api.партнеры.online/notifications/token', { // Укажите полный URL бэкенда
    // const response = await fetch('https://192.192.168.1.12:8887/notifications/token', { // Укажите полный URL бэкенда
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`, // Если требуется авторизация
      },
      body: JSON.stringify({ token }),
    });

    if (response.ok) {
      // console.log('Токен успешно отправлен на сервер.');
    } else {
      console.error('Ошибка при отправке токена на сервер:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Ошибка при отправке токена на сервер:', error);
  }
};


export { messaging };
