const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');

// Import service handlers
const { getUser } = require('../services/unaryService');
const { listUsers } = require('../services/serverStreamService');
const { createUsers } = require('../services/clientStreamService');
const { chatWithUsers } = require('../services/bidirectionalStreamService');

// Load proto file
const PROTO_PATH = path.join(__dirname, '../../', config.grpc.protoPath);

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const learningProto = protoDescriptor[config.grpc.packageName];

/**
 * Start the gRPC server
 */
function startServer() {
  const server = new grpc.Server();

  // Add service with all handlers
  server.addService(learningProto[config.grpc.serviceName].service, {
    GetUser: getUser, // Unary RPC
    ListUsers: listUsers, // Server streaming RPC
    CreateUsers: createUsers, // Client streaming RPC
    ChatWithUsers: chatWithUsers, // Bidirectional streaming RPC
  });

  // Bind server to port
  const serverAddress = `${config.server.host}:${config.server.port}`;

  server.bindAsync(
    serverAddress,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        logger.error('Failed to start server', { error: error.message });
        process.exit(1);
      }

      logger.info('='.repeat(60));
      logger.info('🚀 gRPC Server Started Successfully!');
      logger.info('='.repeat(60));
      logger.info(`📡 Server Address: ${serverAddress}`);
      logger.info(`🔌 Port: ${port}`);
      logger.info(`🌍 Environment: ${config.env}`);
      logger.info(`📦 Service: ${config.grpc.serviceName}`);
      logger.info('='.repeat(60));
      logger.info('Available RPC Methods:');
      logger.info('  1. GetUser (Unary RPC)');
      logger.info('  2. ListUsers (Server Streaming RPC)');
      logger.info('  3. CreateUsers (Client Streaming RPC)');
      logger.info('  4. ChatWithUsers (Bidirectional Streaming RPC)');
      logger.info('='.repeat(60));
    }
  );

  // Graceful shutdown
  process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    server.tryShutdown(() => {
      logger.info('Server shut down successfully');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    server.tryShutdown(() => {
      logger.info('Server shut down successfully');
      process.exit(0);
    });
  });

  return server;
}

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { startServer };
