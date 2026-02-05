const grpc = require('@grpc/grpc-js');

const STATUS_CODES = {
  OK: grpc.status.OK,
  CANCELLED: grpc.status.CANCELLED,
  UNKNOWN: grpc.status.UNKNOWN,
  INVALID_ARGUMENT: grpc.status.INVALID_ARGUMENT,
  DEADLINE_EXCEEDED: grpc.status.DEADLINE_EXCEEDED,
  NOT_FOUND: grpc.status.NOT_FOUND,
  ALREADY_EXISTS: grpc.status.ALREADY_EXISTS,
  PERMISSION_DENIED: grpc.status.PERMISSION_DENIED,
  RESOURCE_EXHAUSTED: grpc.status.RESOURCE_EXHAUSTED,
  FAILED_PRECONDITION: grpc.status.FAILED_PRECONDITION,
  ABORTED: grpc.status.ABORTED,
  OUT_OF_RANGE: grpc.status.OUT_OF_RANGE,
  UNIMPLEMENTED: grpc.status.UNIMPLEMENTED,
  INTERNAL: grpc.status.INTERNAL,
  UNAVAILABLE: grpc.status.UNAVAILABLE,
  DATA_LOSS: grpc.status.DATA_LOSS,
  UNAUTHENTICATED: grpc.status.UNAUTHENTICATED,
};

const MESSAGE_TYPES = {
  USER: 'user',
  SYSTEM: 'system',
  NOTIFICATION: 'notification',
};

const RESPONSE_MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_FOUND: 'User found successfully',
  USER_NOT_FOUND: 'User not found',
  USERS_CREATED: 'Users created successfully',
  INVALID_INPUT: 'Invalid input provided',
};

module.exports = {
  STATUS_CODES,
  MESSAGE_TYPES,
  RESPONSE_MESSAGES,
};
