# gRPC Architecture Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     gRPC Server                             │
│                  (Port: 50051)                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │          LearningService                            │    │
│  ├────────────────────────────────────────────────────┤    │
│  │  1. GetUser (Unary RPC)                           │    │
│  │  2. ListUsers (Server Streaming RPC)              │    │
│  │  3. CreateUsers (Client Streaming RPC)            │    │
│  │  4. ChatWithUsers (Bidirectional Streaming RPC)   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────┬──────────────┬─────────────────────┐     │
│  │   Config    │   Logger     │   Error Handler     │     │
│  │  (.env)     │  (Winston)   │   (gRPC Status)     │     │
│  └─────────────┴──────────────┴─────────────────────┘     │
│                                                             │
│  ┌──────────────────────────────────────────────────┐     │
│  │          In-Memory Database                       │     │
│  │          Map<userId, User>                        │     │
│  └──────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ▲
                          │ gRPC (HTTP/2)
                          │ Protocol Buffers
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    gRPC Clients                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Unary     │  │   Server    │  │   Client    │        │
│  │   Client    │  │   Stream    │  │   Stream    │        │
│  │             │  │   Client    │  │   Client    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  ┌──────────────────────────────────────────────────┐     │
│  │          Bidirectional Client                     │     │
│  │          (Interactive Chat)                       │     │
│  └──────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Unary RPC Flow

```
┌─────────┐                              ┌─────────┐
│ Client  │                              │ Server  │
└────┬────┘                              └────┬────┘
     │                                        │
     │  1. Send UserRequest                  │
     ├───────────────────────────────────────>
     │     { id: 1 }                         │
     │                                        │
     │                                   2. Process
     │                                   - Find/Create User
     │                                   - Validate Data
     │                                        │
     │  3. Return UserResponse                │
     <───────────────────────────────────────┤
     │     { id:1, name:"...", ... }         │
     │                                        │
     ▼                                        ▼
  Display                                   Log
   Result                                  Activity
```

**Use Case**: Authentication, Get Profile, Simple CRUD

---

## 2. Server Streaming RPC Flow

```
┌─────────┐                              ┌─────────┐
│ Client  │                              │ Server  │
└────┬────┘                              └────┬────┘
     │                                        │
     │  1. Send ListUsersRequest             │
     ├───────────────────────────────────────>
     │     { limit: 5, offset: 0 }           │
     │                                        │
     │                                   2. Start Streaming
     │                                   - Get Users
     │  3. Stream User 1                     │
     <───────────────────────────────────────┤
     │     { id:1, name:"Alice" }            │
     │                                        │
     │  4. Stream User 2                     │
     <───────────────────────────────────────┤
     │     { id:2, name:"Bob" }              │
     │                                        │
     │  5. Stream User 3                     │
     <───────────────────────────────────────┤
     │     { id:3, name:"Charlie" }          │
     │                                        │
     │  ... (continue streaming)              │
     │                                        │
     │  6. End Stream                         │
     <───────────────────────────────────────┤
     │                                        │
     ▼                                        ▼
```

**Use Case**: Large datasets, Real-time feeds, Notifications

---

## 3. Client Streaming RPC Flow

```
┌─────────┐                              ┌─────────┐
│ Client  │                              │ Server  │
└────┬────┘                              └────┬────┘
     │                                        │
     │  1. Start Stream                       │
     ├───────────────────────────────────────>
     │                                        │
     │  2. Send User 1                        │
     ├───────────────────────────────────────>
     │     { name:"Michael", ... }            │
     │                                   3. Buffer
     │  4. Send User 2                   & Process
     ├───────────────────────────────────────>
     │     { name:"Sarah", ... }              │
     │                                        │
     │  5. Send User 3                        │
     ├───────────────────────────────────────>
     │     { name:"David", ... }              │
     │                                        │
     │  ... (continue streaming)              │
     │                                        │
     │  6. End Stream                         │
     ├───────────────────────────────────────>
     │                                   7. Process All
     │                                   - Create Users
     │                                   - Validate
     │  8. Return Summary                     │
     <───────────────────────────────────────┤
     │     { total_created: 3, ... }         │
     │                                        │
     ▼                                        ▼
```

**Use Case**: Batch uploads, Log streaming, IoT data collection

---

## 4. Bidirectional Streaming RPC Flow

```
┌─────────┐                              ┌─────────┐
│ Client  │                              │ Server  │
└────┬────┘                              └────┬────┘
     │                                        │
     │  1. Start Stream                       │
     ├───────────────────────────────────────>
     │                                        │
     │  2. Welcome Message                    │
     <───────────────────────────────────────┤
     │     "Welcome to chat!"                 │
     │                                        │
     │  3. Send Message                       │
     ├───────────────────────────────────────>
     │     "Hello!"                      4. Process
     │                                   & Respond
     │  5. Echo Response                      │
     <───────────────────────────────────────┤
     │     "Server received: Hello!"          │
     │                                        │
     │  6. Automated Response                 │
     <───────────────────────────────────────┤
     │     "That's interesting!"              │
     │                                        │
     │  7. Send Another Message               │
     ├───────────────────────────────────────>
     │     "How are you?"                     │
     │                                        │
     │  8. Echo Response                      │
     <───────────────────────────────────────┤
     │                                        │
     │  ... (continue both directions)        │
     │                                        │
     │  9. End Stream                         │
     ├───────────────────────────────────────>
     │                                   10. Cleanup
     │  11. Goodbye Message                   │
     <───────────────────────────────────────┤
     │                                        │
     ▼                                        ▼
```

**Use Case**: Chat apps, Live collaboration, Gaming, Real-time dashboards

---

## Data Flow Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      Client Layer                        │
├──────────────────────────────────────────────────────────┤
│  User Code  →  gRPC Client Stub  →  Serialize (Protobuf)│
└───────────────────────┬──────────────────────────────────┘
                        │
                   HTTP/2 Transport
                   (Binary Protocol)
                        │
┌───────────────────────▼──────────────────────────────────┐
│                     Server Layer                         │
├──────────────────────────────────────────────────────────┤
│  Deserialize (Protobuf)  →  Route  →  Service Handler   │
│                                ▼                         │
│  ┌─────────────────────────────────────────────┐        │
│  │         Service Implementations              │        │
│  ├─────────────────────────────────────────────┤        │
│  │  • Unary Service                            │        │
│  │  • Server Stream Service                    │        │
│  │  • Client Stream Service                    │        │
│  │  • Bidirectional Stream Service             │        │
│  └─────────────┬───────────────────────────────┘        │
│                ▼                                         │
│  ┌─────────────────────────────────────────────┐        │
│  │         Utilities & Infrastructure           │        │
│  ├─────────────────────────────────────────────┤        │
│  │  • Logger (Winston)                         │        │
│  │  • Error Handler                            │        │
│  │  • Configuration                            │        │
│  │  • Database (In-Memory Map)                 │        │
│  └─────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────┘
```

---

## Protocol Buffers Message Flow

```
JavaScript Object (Client)
         │
         ▼
┌─────────────────┐
│  Serialization  │  ← Protocol Buffers
└────────┬────────┘
         │
         ▼
Binary Data (Network)
         │
         ▼
┌─────────────────┐
│ Deserialization │  ← Protocol Buffers
└────────┬────────┘
         │
         ▼
JavaScript Object (Server)
         │
         ▼
Business Logic Processing
         │
         ▼
JavaScript Object (Response)
         │
         ▼
(Repeat serialization cycle)
```

---

## Error Handling Flow

```
┌──────────────┐
│    Client    │
│   Request    │
└──────┬───────┘
       │
       ▼
┌──────────────┐      Error?     ┌──────────────┐
│   Service    │─────────YES─────>│    Error     │
│   Handler    │                  │   Handler    │
└──────┬───────┘                  └──────┬───────┘
       │                                 │
       NO                                │
       │                                 │
       ▼                                 ▼
┌──────────────┐              ┌──────────────────┐
│   Success    │              │   gRPC Error     │
│   Response   │              │   • Code         │
└──────┬───────┘              │   • Message      │
       │                      │   • Details      │
       │                      └──────┬───────────┘
       │                             │
       │                             │
       └──────────┬──────────────────┘
                  │
                  ▼
           ┌──────────────┐
           │    Logger    │
           │  (Winston)   │
           └──────┬───────┘
                  │
                  ▼
           ┌──────────────┐
           │  Log Files   │
           │  • combined  │
           │  • error     │
           └──────────────┘
```

---

## Streaming Backpressure

```
Fast Client        Slow Server
     │                 │
     │   Message 1     │
     ├────────────────>│ Processing...
     │   Message 2     │
     ├────────────────>│ Buffer
     │   Message 3     │
     ├────────────────>│ Buffer
     │                 │
     │   PAUSE         │ Buffer Full!
     <────────────────┤
     │                 │
     │   (wait)        │ Processing...
     │                 │
     │   RESUME        │ Buffer Available
     <────────────────┤
     │   Message 4     │
     ├────────────────>│
```

---

## Project File Organization

```
proto/
  └── learning.proto ──────────┐
                               │ Defines Contract
                               │
src/                           ▼
  ├── server/            ┌──────────────┐
  │   └── index.js ─────>│ gRPC Server  │<──── Binds Services
  │                      └──────────────┘
  ├── services/                │
  │   ├── unaryService.js ─────┤
  │   ├── serverStreamService.js ──┤
  │   ├── clientStreamService.js ──┤
  │   └── bidirectionalStreamService.js ─┘
  │                           
  ├── clients/            (Test Each Service)
  │   ├── unaryClient.js
  │   ├── serverStreamClient.js
  │   ├── clientStreamClient.js
  │   └── bidirectionalClient.js
  │
  ├── config/             (Configuration)
  │   └── index.js
  │
  └── utils/              (Shared Utilities)
      ├── logger.js
      ├── errorHandler.js
      └── constants.js
```

---

## Deployment Architecture (Future)

```
                    Load Balancer
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   ┌─────────┐     ┌─────────┐     ┌─────────┐
   │ Server  │     │ Server  │     │ Server  │
   │ Pod 1   │     │ Pod 2   │     │ Pod 3   │
   └────┬────┘     └────┬────┘     └────┬────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
                    ┌────▼────┐
                    │ Database│
                    │ (Redis/ │
                    │  Mongo) │
                    └─────────┘
```

This is for future production deployment with:
- Multiple server instances
- Load balancing
- Persistent database
- Health checks
- Auto-scaling

---

**Note**: These diagrams illustrate the architecture and data flow of your gRPC learning project. Use them as reference while exploring the code!
