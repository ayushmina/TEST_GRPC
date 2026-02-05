const logger = require('../utils/logger');
const { errorHandler } = require('../utils/errorHandler');
const { usersDB } = require('./unaryService');

/**
 * 2. SERVER STREAMING RPC
 * Client sends one request, server sends multiple responses as a stream
 */
const listUsers = (call) => {
  try {
    const { limit = 10, offset = 0 } = call.request;

    logger.info('Server Streaming RPC - ListUsers called', { limit, offset });

    // Validate input
    if (limit < 1 || limit > 100) {
      call.emit('error', errorHandler.invalidArgument('Limit must be between 1 and 100'));
      return;
    }

    if (offset < 0) {
      call.emit('error', errorHandler.invalidArgument('Offset must be non-negative'));
      return;
    }

    // Get all users
    const allUsers = Array.from(usersDB.values());

    // If no users, create some sample data
    if (allUsers.length === 0) {
      logger.info('No users found, creating sample data');
      const sampleUsers = [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
        { id: 3, name: 'Charlie', email: 'charlie@example.com' },
        { id: 4, name: 'Diana', email: 'diana@example.com' },
        { id: 5, name: 'Eve', email: 'eve@example.com' },
      ];

      sampleUsers.forEach((user) => {
        usersDB.set(user.id, {
          ...user,
          created_at: new Date().toISOString(),
        });
      });
    }

    // Get paginated users
    const users = Array.from(usersDB.values()).slice(offset, offset + limit);

    logger.info(`Streaming ${users.length} users to client`);

    // Stream users to client one by one
    users.forEach((user, index) => {
      // Simulate delay for demonstration
      setTimeout(() => {
        logger.info(`Streaming user ${index + 1}/${users.length}`, { userId: user.id });
        call.write({
          ...user,
          success: true,
          message: `User ${index + 1} of ${users.length}`,
        });

        // End stream after last user
        if (index === users.length - 1) {
          logger.info('Server streaming completed');
          call.end();
        }
      }, index * 500); // 500ms delay between each user
    });

    // If no users after offset
    if (users.length === 0) {
      logger.info('No users to stream');
      call.end();
    }
  } catch (error) {
    logger.error('Error in listUsers', { error: error.message });
    call.emit('error', errorHandler.internal(error.message));
  }
};

module.exports = {
  listUsers,
};
