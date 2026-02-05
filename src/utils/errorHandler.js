const grpc = require('@grpc/grpc-js');

class GrpcError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'GrpcError';
    this.code = code;
    this.details = details;
  }
}

const errorHandler = {
  /**
   * Handle errors in gRPC calls
   */
  handleError(error, callback) {
    if (error instanceof GrpcError) {
      const grpcError = {
        code: error.code,
        message: error.message,
        details: JSON.stringify(error.details),
      };
      callback(grpcError);
    } else {
      callback({
        code: grpc.status.INTERNAL,
        message: error.message || 'Internal server error',
      });
    }
  },

  /**
   * Create a not found error
   */
  notFound(message = 'Resource not found') {
    return new GrpcError(grpc.status.NOT_FOUND, message);
  },

  /**
   * Create an invalid argument error
   */
  invalidArgument(message = 'Invalid argument') {
    return new GrpcError(grpc.status.INVALID_ARGUMENT, message);
  },

  /**
   * Create an already exists error
   */
  alreadyExists(message = 'Resource already exists') {
    return new GrpcError(grpc.status.ALREADY_EXISTS, message);
  },

  /**
   * Create an internal error
   */
  internal(message = 'Internal server error') {
    return new GrpcError(grpc.status.INTERNAL, message);
  },
};

module.exports = { GrpcError, errorHandler };
