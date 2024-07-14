const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/user');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

// Serve static files from the public directory
app.use(express.static(publicDirectoryPath));

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    // Handle user joining a chat room
    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options });

        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        // Send welcome message to the user
        socket.emit('message', generateMessage('Admin', 'Welcome!'));
        // Broadcast to other users in the room that a new user has joined
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`));
        // Send room data to all users in the room
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback();
    });

    // Handle sending messages
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!');
        }

        // Broadcast the message to all users in the room
        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback();
    });

    // Handle sending location
    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);
        // Broadcast the location message to all users in the room
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            // Broadcast to all users in the room that a user has left
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`));
            // Update room data for all users in the room
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server is up on port ${port}!`);
});
