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
console.log('📞 UNARY RPC CLIENT EXAMPLE');
console.log('='.repeat(60));
console.log('Demonstrating simple request-response communication\n');

/**
 * Example 1: Get user by ID
 */
function getUserById() {
  console.log('1️⃣  Requesting user with ID: 1');

  client.GetUser({ id: 1, name: '', email: '' }, (error, response) => {
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    console.log('✅ Response received:');
    console.log('   User ID:', response.id);
    console.log('   Name:', response.name);
    console.log('   Email:', response.email);
    console.log('   Created At:', response.created_at);
    console.log('   Message:', response.message);
    console.log('');
  });
}

/**
 * Example 2: Get/Create user by name
 */
function getUserByName() {
  setTimeout(() => {
    console.log('2️⃣  Requesting user with name: "John Doe"');

    client.GetUser({ id: 0, name: 'John Doe', email: 'john@example.com' }, (error, response) => {
      if (error) {
        console.error('❌ Error:', error.message);
        return;
      }

      console.log('✅ Response received:');
      console.log('   User ID:', response.id);
      console.log('   Name:', response.name);
      console.log('   Email:', response.email);
      console.log('   Created At:', response.created_at);
      console.log('   Message:', response.message);
      console.log('');
    });
  }, 1000);
}

/**
 * Example 3: Get/Create user by email
 */
function getUserByEmail() {
  setTimeout(() => {
    console.log('3️⃣  Requesting user with email: "jane@example.com"');

    client.GetUser({ id: 0, name: 'Jane Smith', email: 'jane@example.com' }, (error, response) => {
      if (error) {
        console.error('❌ Error:', error.message);
        return;
      }

      console.log('✅ Response received:');
      console.log('   User ID:', response.id);
      console.log('   Name:', response.name);
      console.log('   Email:', response.email);
      console.log('   Created At:', response.created_at);
      console.log('   Message:', response.message);
      console.log('');
      console.log('='.repeat(60));
      console.log('✨ Unary RPC demonstration completed!');
      console.log('='.repeat(60));
    });
  }, 2000);
}

// Run examples
getUserById();
getUserByName();
getUserByEmail();
