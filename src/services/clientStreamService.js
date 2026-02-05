const logger = require('../utils/logger');
const { errorHandler } = require('../utils/errorHandler');
const { usersDB, getUserIdCounter, setUserIdCounter } = require('./unaryService');
const { RESPONSE_MESSAGES } = require('../utils/constants');

/**
 * 3. CLIENT STREAMING RPC
 * Client sends multiple requests as a stream, server sends one response
 */
const createUsers = (call, callback) => {
  const createdUsers = [];
  let requestCount = 0;

  logger.info('Client Streaming RPC - CreateUsers started');

  // Handle each incoming user data from client stream
  call.on('data', (userRequest) => {
    try {
      requestCount++;
      logger.info(`Received user data ${requestCount}`, userRequest);

      // Validate user data
      if (!userRequest.name || !userRequest.email) {
        logger.warn('Invalid user data received', userRequest);
        return;
      }

      // Check if user already exists
      const existingUser = Array.from(usersDB.values()).find(
        (u) => u.email === userRequest.email
      );

      if (existingUser) {
        logger.warn('User with email already exists', { email: userRequest.email });
        return;
      }

      // Create new user
      const newUser = {
        id: getUserIdCounter(),
        name: userRequest.name,
        email: userRequest.email,
        created_at: new Date().toISOString(),
      };

      setUserIdCounter(getUserIdCounter() + 1);
      usersDB.set(newUser.id, newUser);
      createdUsers.push(newUser);

      logger.info('User created via stream', newUser);
    } catch (error) {
      logger.error('Error processing user data', { error: error.message });
    }
  });

  // Handle stream end
  call.on('end', () => {
    logger.info('Client streaming ended', {
      totalReceived: requestCount,
      totalCreated: createdUsers.length,
    });

    // Send response with summary
    callback(null, {
      total_created: createdUsers.length,
      user_ids: createdUsers.map((u) => u.id),
      success: true,
      message: `${RESPONSE_MESSAGES.USERS_CREATED} (${createdUsers.length} users created)`,
    });
  });

  // Handle stream errors
  call.on('error', (error) => {
    logger.error('Error in client stream', { error: error.message });
    errorHandler.handleError(error, callback);
  });
};

module.exports = {
  createUsers,
};
