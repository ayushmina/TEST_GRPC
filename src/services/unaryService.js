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
const helloUser = (call, callback) => {
  try {
    const { name } = call.request;

    logger.info('Unary RPC - HelloUser called', { name });

    // call.on("data", (request) => {
    //   logger.info('Received request data', request);
    // });

    if (!name) {
      return errorHandler.handleError(
        errorHandler.invalidArgument('Name parameter is required'),
        callback
      );
    }

    const message = `Hello, ${name}! Welcome to our gRPC service.`;

    logger.info('Generated greeting message', { message });

    callback(null, {
      success: "true",
      message,
    });
  } catch (error) {
    logger.error('Error in helloUser', { error: error.message });
    errorHandler.handleError(error, callback);
  }
}

// Track server start time for uptime calculation
const serverStartTime = Date.now();

/**
 * DEMO UNARY RPC - Get Server Information
 * Simple unary function that returns server status and information
 */
const getServerInfo = (call, callback) => {
  try {
    logger.info('Unary RPC - GetServerInfo called');

    // Calculate uptime in seconds
    const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    const uptimeFormatted = `${hours}h ${minutes}m ${seconds}s`;

    // Get active connections count (using usersDB size as a proxy)
    const activeConnections = usersDB.size;

    const serverInfo = {
      server_name: 'gRPC Demo Server',
      version: '1.0.0',
      uptime: uptimeFormatted,
      active_connections: activeConnections,
      timestamp: new Date().toISOString(),
      success: true,
    };

    logger.info('Server info retrieved', serverInfo);

    callback(null, serverInfo);
  } catch (error) {
    logger.error('Error in getServerInfo', { error: error.message });
    errorHandler.handleError(error, callback);
  }
};

module.exports = {
  getUser,
  usersDB,
  helloUser,
  getServerInfo,
  getUserIdCounter: () => userIdCounter,
  setUserIdCounter: (value) => {
    userIdCounter = value;
  },
};
