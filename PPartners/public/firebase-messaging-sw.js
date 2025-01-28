importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

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

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Фоновое сообщение:', payload);

  const { title, body} = payload.data;

  self.registration.showNotification(title, {
    body,
    icon: '/icon.jpg',
  });
});
