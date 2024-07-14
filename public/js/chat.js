// Establish a WebSocket connection to the server
const socket = io();

// DOM elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Extract username and room from URL query parameters
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

// Function to scroll the chat window to the bottom
const autoscroll = () => {
    const $newMessage = $messages.lastElementChild;
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
    const visibleHeight = $messages.offsetHeight;
    const containerHeight = $messages.scrollHeight;
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
};

// Listen for incoming messages from the server
socket.on('message', (message) => {
    // Render the message using Mustache template
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    // Append the rendered message to the chat window
    $messages.insertAdjacentHTML('beforeend', html);
    // Autoscroll to the bottom of the chat window
    autoscroll();
});

// Listen for incoming location messages from the server
socket.on('locationMessage', (message) => {
    // Render the location message using Mustache template
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    // Append the rendered location message to the chat window
    $messages.insertAdjacentHTML('beforeend', html);
    // Autoscroll to the bottom of the chat window
    autoscroll();
});

// Listen for room data updates from the server
socket.on('roomData', ({ room, users }) => {
    // Render the sidebar using Mustache template
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    // Update the sidebar with the rendered HTML
    document.querySelector('#sidebar').innerHTML = html;
});

// Handle form submission for sending messages
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Disable the send button to prevent multiple submissions
    $messageFormButton.setAttribute('disabled', 'disabled');

    // Extract the message from the form input
    const message = e.target.elements.message.value;

    // Emit the message to the server
    socket.emit('sendMessage', message, (error) => {
        // Enable the send button
        $messageFormButton.removeAttribute('disabled');
        // Clear the message input field and focus on it
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if (error) {
            // Log any errors to the console
            return console.log(error);
        }

        // Log a success message to the console
        console.log('Message delivered!');
    });
});

// Handle button click for sending location
$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        // Alert the user if geolocation is not supported by their browser
        return alert('Geolocation is not supported by your browser.');
    }

    // Disable the send location button to prevent multiple clicks
    $sendLocationButton.setAttribute('disabled', 'disabled');

    // Get the user's current position using the geolocation API
    navigator.geolocation.getCurrentPosition((position) => {
        // Emit the user's location to the server
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            // Re-enable the send location button after the location is shared
            $sendLocationButton.removeAttribute('disabled');
            // Log a success message to the console
            console.log('Location shared!');
        });
    });
});

// Emit a 'join' event to the server when the user joins a room
socket.emit('join', { username, room }, (error) => {
    if (error) {
        // Alert the user if there's an error joining the room and redirect to the homepage
        alert(error);
        location.href = '/';
    }
});
