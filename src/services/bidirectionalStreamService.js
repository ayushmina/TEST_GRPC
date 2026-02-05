const logger = require('../utils/logger');
const { MESSAGE_TYPES } = require('../utils/constants');

/**
 * 4. BIDIRECTIONAL STREAMING RPC
 * Both client and server send streams of messages independently
 */
const chatWithUsers = (call) => {
  logger.info('Bidirectional Streaming RPC - ChatWithUsers started');

  // Store client info
  const clientId = `client_${Date.now()}`;
  logger.info('New chat client connected', { clientId });

  // Send welcome message to client
  call.write({
    user_id: 0,
    username: 'System',
    message: 'Welcome to the chat! You can start sending messages.',
    timestamp: new Date().toISOString(),
    message_type: MESSAGE_TYPES.SYSTEM,
  });

  let messageCount = 0;

  // Handle incoming messages from client
  call.on('data', (chatMessage) => {
    try {
      messageCount++;
      logger.info(`Received message ${messageCount} from client`, {
        clientId,
        message: chatMessage.message,
      });

      // Echo the message back to client (with modification)
      call.write({
        user_id: chatMessage.user_id,
        username: chatMessage.username || 'Anonymous',
        message: `Server received: "${chatMessage.message}"`,
        timestamp: new Date().toISOString(),
        message_type: MESSAGE_TYPES.SYSTEM,
      });

      // Send an automated response based on message content
      setTimeout(() => {
        const responses = [
          'That\'s interesting! Tell me more.',
          'I understand what you mean.',
          'Thanks for sharing!',
          'Great point!',
          'Let me think about that...',
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        call.write({
          user_id: 0,
          username: 'ChatBot',
          message: randomResponse,
          timestamp: new Date().toISOString(),
          message_type: MESSAGE_TYPES.USER,
        });

        logger.info('Sent automated response', { clientId, response: randomResponse });
      }, 1000);

      // Send notification every 3 messages
      if (messageCount % 3 === 0) {
        setTimeout(() => {
          call.write({
            user_id: 0,
            username: 'System',
            message: `You've sent ${messageCount} messages in this session.`,
            timestamp: new Date().toISOString(),
            message_type: MESSAGE_TYPES.NOTIFICATION,
          });

          logger.info('Sent notification', { clientId, messageCount });
        }, 1500);
      }
    } catch (error) {
      logger.error('Error processing chat message', {
        clientId,
        error: error.message,
      });
    }
  });

  // Handle stream end
  call.on('end', () => {
    logger.info('Chat client disconnected', {
      clientId,
      totalMessages: messageCount,
    });

    call.write({
      user_id: 0,
      username: 'System',
      message: `Goodbye! You sent ${messageCount} messages in this session.`,
      timestamp: new Date().toISOString(),
      message_type: MESSAGE_TYPES.SYSTEM,
    });

    call.end();
  });

  // Handle stream errors
  call.on('error', (error) => {
    logger.error('Error in bidirectional stream', {
      clientId,
      error: error.message,
    });
  });
};

module.exports = {
  chatWithUsers,
};
