# Quick Start Guide

## Run the Project in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Server
```bash
npm start
```

You should see:
```
🚀 gRPC Server Started Successfully!
📡 Server Address: 0.0.0.0:50051
```

### Step 3: Run a Client (in a new terminal)

**Try Unary RPC:**
```bash
npm run client:unary
```

**Try Server Streaming:**
```bash
npm run client:server-stream
```

**Try Client Streaming:**
```bash
npm run client:client-stream
```

**Try Bidirectional Streaming:**
```bash
npm run client:bidirectional
```

## What Each Client Does

### Unary Client
- Sends 3 separate requests to get/create users
- Simple request → response pattern
- **Best for:** Authentication, fetching single records

### Server Stream Client
- Requests list of users
- Server streams them one by one
- **Best for:** Large datasets, real-time feeds

### Client Stream Client
- Sends 5 users to server via streaming
- Server responds with summary after all sent
- **Best for:** Batch uploads, data ingestion

### Bidirectional Client
- Interactive chat simulation
- Both client and server stream messages
- **Best for:** Chat apps, live collaboration

## Common Commands

```bash
# Development mode with auto-restart
npm run start:dev

# Check code style
npm run lint

# Format code
npm run format

# View logs
tail -f logs/combined.log
```

## Troubleshooting

**Port already in use?**
```bash
# Change port in .env file
PORT=50052
```

**Connection refused?**
- Make sure the server is running first
- Check if firewall is blocking the port

**Module not found?**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. ✅ Run all four client examples
2. 📝 Modify the proto file to add your own service
3. 🔨 Implement the service handler
4. 🧪 Create a client to test it
5. 📖 Read the main README.md for detailed documentation
