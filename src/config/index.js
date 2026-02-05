require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 50051,
    host: process.env.HOST || '0.0.0.0',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || './logs',
  },
  env: process.env.NODE_ENV || 'development',
  grpc: {
    protoPath: './proto/learning.proto',
    packageName: 'learning',
    serviceName: 'LearningService',
  },
};

module.exports = config;
