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
console.log('📤 CLIENT STREAMING RPC CLIENT EXAMPLE');
console.log('='.repeat(60));
console.log('Demonstrating client sending multiple requests\n');

/**
 * Create multiple users via client streaming
 */
function createUsers() {
  // Create a client stream
  const call = client.CreateUsers((error, response) => {
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    console.log('\n✅ Server response received:');
    console.log('   Total Created:', response.total_created);
    console.log('   User IDs:', response.user_ids.join(', '));
    console.log('   Success:', response.success);
    console.log('   Message:', response.message);
    console.log('');
    console.log('='.repeat(60));
    console.log('✨ Client streaming completed!');
    console.log('='.repeat(60));
  });

  // Sample users to create
  const users = [
    { id: 0, name: 'Michael Brown', email: 'michael@example.com' },
    { id: 0, name: 'Sarah Wilson', email: 'sarah@example.com' },
    { id: 0, name: 'David Lee', email: 'david@example.com' },
    { id: 0, name: 'Emma Davis', email: 'emma@example.com' },
    { id: 0, name: 'James Taylor', email: 'james@example.com' },
  ];

  console.log(`📤 Streaming ${users.length} users to server...\n`);

  // Stream users to server
  users.forEach((user, index) => {
    setTimeout(() => {
      console.log(`📨 Sending user ${index + 1}/${users.length}:`, user.name);
      call.write(user);

      // End the stream after sending all users
      if (index === users.length - 1) {
        setTimeout(() => {
          console.log('\n✅ All users sent, ending stream...');
          call.end();
        }, 500);
      }
    }, index * 300); // 300ms delay between each user
  });

  // Handle stream errors
  call.on('error', (error) => {
    console.error('❌ Stream error:', error.message);
  });
}

// Run example
createUsers();
