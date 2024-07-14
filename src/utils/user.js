// Array to store active users
const users = [];

// Function to add a user to the users array
const addUser = ({ id, username, room }) => {
    // Clean the data by trimming whitespace and converting to lowercase
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required'
        };
    }

    // Check if the username is already taken in the room
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    });

    // If the username is already taken, return an error
    if (existingUser) {
        return {
            error: "Username already exists!"
        };
    }

    // Store the user in the users array
    const user = { id, username, room };
    users.push(user);
    return { user };
};

// Function to remove a user from the users array
const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id;
    });

    // If the user exists, remove them from the users array and return the removed user
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};

// Function to get a user by their socket ID
const getUser = (id) => {
    return users.find((user) => {
        return user.id == id;
    });
};

// Function to get all users in a specific room
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => {
        return user.room === room;
    });
};

// Export the addUser, removeUser, getUser, and getUsersInRoom functions
module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};
