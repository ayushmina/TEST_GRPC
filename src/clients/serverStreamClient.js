const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const config = require('../config');

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

// Create client
const client = new learningProto[config.grpc.serviceName](
  `${config.server.host}:${config.server.port}`,
  grpc.credentials.createInsecure()
);

console.log('='.repeat(60));
console.log('📡 SERVER STREAMING RPC CLIENT EXAMPLE');
console.log('='.repeat(60));
console.log('Demonstrating server sending multiple responses\n');

/**
 * List users with server streaming
 */
function listUsers() {
  const request = {
    limit: 5,
    offset: 0,
  };

  console.log(`📤 Sending request: limit=${request.limit}, offset=${request.offset}`);
  console.log('📥 Waiting for server to stream users...\n');

  const call = client.ListUsers(request);

  let userCount = 0;

  // Handle incoming data stream
  call.on('data', (response) => {
    userCount++;
    console.log(`✅ Received user ${userCount}:`);
    console.log('   User ID:', response.id);
    console.log('   Name:', response.name);
    console.log('   Email:', response.email);
    console.log('   Created At:', response.created_at);
    console.log('   Message:', response.message);
    console.log('');
  });

  // Handle stream end
  call.on('end', () => {
    console.log('='.repeat(60));
    console.log(`✨ Server streaming completed! Received ${userCount} users.`);
    console.log('='.repeat(60));
  });

  // Handle errors
  call.on('error', (error) => {
    console.error('❌ Error:', error.message);
  });

  // Handle status
  call.on('status', (status) => {
    console.log('📊 Stream status:', status.code === grpc.status.OK ? 'OK' : status.details);
  });
}

// Run example
listUsers();
