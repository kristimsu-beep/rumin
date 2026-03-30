const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(__dirname));

// База данных в памяти (пока сервер запущен)
let messages = [];
let comments = {}; 

io.on('connection', (socket) => {
    // Отправляем новому пользователю старые сообщения и комменты
    socket.emit('init', { messages, comments });

    // Слушаем новое сообщение в чате
    socket.on('chat message', (msg) => {
        messages.push(msg);
        io.emit('chat message', msg); // Рассылаем всем
    });

    // Слушаем новый комментарий
    socket.on('new comment', (data) => {
        if (!comments[data.id]) comments[data.id] = [];
        comments[data.id].push(data.text);
        io.emit('update comments', { id: data.id, text: data.text });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
