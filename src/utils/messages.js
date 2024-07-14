// Function to generate a message object
const generateMessage = (username, text) => {
    // Return a message object with username, text, and current timestamp
    return {
        username,
        text,
        createdAt: new Date().getTime()
    };
};

// Function to generate a location message object
const generateLocationMessage = (username, url) => {
    // Return a location message object with username, URL, and current timestamp
    return {
        username,
        url,
        createdAt: new Date().getTime()
    };
};

// Export the generateMessage and generateLocationMessage functions
module.exports = {
    generateMessage,
    generateLocationMessage
};
