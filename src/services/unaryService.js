const logger = require('../utils/logger');
const { errorHandler } = require('../utils/errorHandler');
const { RESPONSE_MESSAGES } = require('../utils/constants');

// In-memory database simulation
const usersDB = new Map();
let userIdCounter = 1;

/**
 * 1. UNARY RPC - Simple request-response
 * Client sends one request, server sends one response
 */
const getUser = (call, callback) => {
  try {
    const { id, name, email } = call.request;

    logger.info('Unary RPC - GetUser called', { id, name, email });

    // Validate input
    if (!id && !name && !email) {
      return errorHandler.handleError(
        errorHandler.invalidArgument('At least one parameter (id, name, or email) is required'),
        callback
      );
    }

    // Find user
    let user = null;
    if (id) {
      user = usersDB.get(id);
    } else if (name) {
      user = Array.from(usersDB.values()).find((u) => u.name === name);
    } else if (email) {
      user = Array.from(usersDB.values()).find((u) => u.email === email);
    }

    if (!user) {
      // Create a new user if not found
      const newUser = {
        id: userIdCounter++,
        name: name || `User${userIdCounter}`,
        email: email || `user${userIdCounter}@example.com`,
        created_at: new Date().toISOString(),
      };
      usersDB.set(newUser.id, newUser);

      logger.info('User created', newUser);

      callback(null, {
        ...newUser,
        success: true,
        message: RESPONSE_MESSAGES.USER_CREATED,
      });
    } else {
      logger.info('User found', user);

      callback(null, {
        ...user,
        success: true,
        message: RESPONSE_MESSAGES.USER_FOUND,
      });
    }
  } catch (error) {
    logger.error('Error in getUser', { error: error.message });
    errorHandler.handleError(error, callback);
  }
};

module.exports = {
  getUser,
  usersDB,
  getUserIdCounter: () => userIdCounter,
  setUserIdCounter: (value) => {
    userIdCounter = value;
  },
};
