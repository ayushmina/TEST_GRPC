# gRPC Server - Production-Level Node.js Implementation

A complete production-ready gRPC server implementation in Node.js demonstrating all four types of RPC communication patterns.

## 🎯 Features

- ✅ **Unary RPC** - Traditional request-response communication
- ✅ **Server Streaming RPC** - Server sends multiple responses
- ✅ **Client Streaming RPC** - Client sends multiple requests
- ✅ **Bidirectional Streaming RPC** - Two-way streaming communication
- 📁 **Production-level folder structure**
- 📝 **Comprehensive logging with Winston**
- 🛡️ **Error handling and validation**
- 🔧 **Environment-based configuration**
- 📦 **Clean separation of concerns**

## 📂 Project Structure

```
GRPC/
├── proto/                      # Protocol Buffer definitions
│   └── learning.proto         # Service and message definitions
├── src/
│   ├── config/                # Configuration files
│   │   └── index.js          # Server and app configuration
│   ├── server/                # Server implementation
│   │   └── index.js          # Main gRPC server
│   ├── services/              # RPC service handlers
│   │   ├── unaryService.js           # Unary RPC handler
│   │   ├── serverStreamService.js    # Server streaming handler
│   │   ├── clientStreamService.js    # Client streaming handler
│   │   └── bidirectionalStreamService.js  # Bidirectional handler
│   ├── clients/               # Client examples
│   │   ├── unaryClient.js            # Unary RPC client
│   │   ├── serverStreamClient.js     # Server streaming client
│   │   ├── clientStreamClient.js     # Client streaming client
│   │   └── bidirectionalClient.js    # Bidirectional client
│   └── utils/                 # Utility functions
│       ├── logger.js          # Winston logger configuration
│       ├── errorHandler.js    # Error handling utilities
│       └── constants.js       # Application constants
├── logs/                      # Log files (auto-generated)
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
├── .eslintrc.json          # ESLint configuration
├── .prettierrc.json        # Prettier configuration
├── package.json            # Project dependencies
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Create logs directory:**
   ```bash
   mkdir -p logs
   ```

## 🎮 Usage

### Start the Server

```bash
npm start
```

The server will start on `localhost:50051` by default.

### Run Client Examples

Open separate terminal windows and run:

#### 1. Unary RPC Client
```bash
npm run client:unary
```
Demonstrates simple request-response pattern.

#### 2. Server Streaming RPC Client
```bash
npm run client:server-stream
```
Demonstrates server streaming multiple responses.

#### 3. Client Streaming RPC Client
```bash
npm run client:client-stream
```
Demonstrates client streaming multiple requests.

#### 4. Bidirectional Streaming RPC Client
```bash
npm run client:bidirectional
```
Demonstrates two-way streaming communication.

For automated demo:
```bash
npm run client:bidirectional -- --auto
```

## 📚 RPC Types Explained

### 1. Unary RPC (Request-Response)
**Use Case:** Simple operations like fetching a single user, authenticating, etc.

```javascript
// Client sends one request
client.GetUser({ id: 1 }, (error, response) => {
  console.log(response);
});
```

**Example:** User authentication, fetching profile data

---

### 2. Server Streaming RPC
**Use Case:** When server needs to send large datasets or real-time updates.

```javascript
// Server streams multiple responses
const call = client.ListUsers({ limit: 10 });
call.on('data', (user) => {
  console.log(user);
});
```

**Example:** Live stock prices, real-time notifications, paginated data

---

### 3. Client Streaming RPC
**Use Case:** When client needs to send large amounts of data efficiently.

```javascript
// Client streams multiple requests
const call = client.CreateUsers((error, response) => {
  console.log(response);
});
users.forEach(user => call.write(user));
call.end();
```

**Example:** Batch uploads, log streaming, sensor data collection

---

### 4. Bidirectional Streaming RPC
**Use Case:** Real-time two-way communication.

```javascript
// Both sides stream independently
const call = client.ChatWithUsers();
call.on('data', (message) => console.log(message));
call.write({ message: 'Hello!' });
```

**Example:** Chat applications, live collaboration, multiplayer games

## 🔧 Configuration

Edit `.env` file to customize:

```env
PORT=50051              # Server port
HOST=0.0.0.0           # Server host
LOG_LEVEL=info         # Logging level (error, warn, info, debug)
LOG_DIR=./logs         # Log directory path
NODE_ENV=development   # Environment (development, production)
```

## 📝 API Reference

### GetUser (Unary RPC)
Get or create a user by ID, name, or email.

**Request:**
```protobuf
message UserRequest {
  int32 id = 1;
  string name = 2;
  string email = 3;
}
```

**Response:**
```protobuf
message UserResponse {
  int32 id = 1;
  string name = 2;
  string email = 3;
  string created_at = 4;
  bool success = 5;
  string message = 6;
}
```

---

### ListUsers (Server Streaming RPC)
Stream a list of users with pagination.

**Request:**
```protobuf
message ListUsersRequest {
  int32 limit = 1;
  int32 offset = 2;
}
```

**Response Stream:**
```protobuf
stream UserResponse
```

---

### CreateUsers (Client Streaming RPC)
Create multiple users via streaming.

**Request Stream:**
```protobuf
stream UserRequest
```

**Response:**
```protobuf
message CreateUsersResponse {
  int32 total_created = 1;
  repeated int32 user_ids = 2;
  bool success = 3;
  string message = 4;
}
```

---

### ChatWithUsers (Bidirectional Streaming RPC)
Real-time chat with bidirectional streaming.

**Request/Response Stream:**
```protobuf
message ChatMessage {
  int32 user_id = 1;
  string username = 2;
  string message = 3;
  string timestamp = 4;
  string message_type = 5;
}
```

## 🧪 Testing

Run linting:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

Run tests (when implemented):
```bash
npm test
```

## 📊 Logging

Logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

Console output is formatted for development with colors and timestamps.

## 🔒 Production Considerations

### Security
- [ ] Implement TLS/SSL for encrypted communication
- [ ] Add authentication/authorization middleware
- [ ] Validate and sanitize all inputs
- [ ] Implement rate limiting

### Performance
- [ ] Add connection pooling
- [ ] Implement caching strategies
- [ ] Monitor memory usage for streams
- [ ] Set appropriate timeouts

### Monitoring
- [ ] Add Prometheus metrics
- [ ] Implement health checks
- [ ] Set up distributed tracing
- [ ] Configure alerting

### Deployment
- [ ] Containerize with Docker
- [ ] Set up CI/CD pipeline
- [ ] Configure load balancing
- [ ] Implement graceful shutdown (✅ Already implemented)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🎓 Learning Resources

- [gRPC Official Documentation](https://grpc.io/docs/)
- [Protocol Buffers Guide](https://developers.google.com/protocol-buffers)
- [@grpc/grpc-js NPM Package](https://www.npmjs.com/package/@grpc/grpc-js)
- [gRPC Node.js Examples](https://github.com/grpc/grpc-node/tree/master/examples)

## 💡 Tips for Learning

1. **Start with Unary RPC** - It's the simplest pattern
2. **Experiment with streaming** - Try modifying the delay times
3. **Add your own services** - Practice by adding new RPC methods
4. **Error handling** - Intentionally cause errors to see how they're handled
5. **Monitor logs** - Check the logs/ directory to understand flow

## 📞 Support

For questions or issues:
- Check the [gRPC documentation](https://grpc.io/docs/)
- Review the code comments in the source files
- Examine the client examples for usage patterns

---

**Happy Learning! 🚀**
