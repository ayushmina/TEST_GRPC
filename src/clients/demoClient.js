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
console.log('🎯 DEMO UNARY RPC CLIENT - GetServerInfo');
console.log('='.repeat(60));
console.log('Demonstrating simple server information retrieval\n');

/**
 * Demo: Get Server Information
 * This is a simple unary RPC that returns server status
 */
function getServerInfo() {
  console.log('📡 Requesting server information...\n');

  // Call the GetServerInfo RPC with empty request
  client.GetServerInfo({}, (error, response) => {
    if (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }

    console.log('✅ Response received:');
    console.log('   Server Name:', response.server_name);
    console.log('   Version:', response.version);
    console.log('   Uptime:', response.uptime);
    console.log('   Total Users:', response.total_users);
    console.log('   Timestamp:', response.timestamp);
    console.log('   Success:', response.success);
    console.log('');
    console.log('='.repeat(60));
    console.log('✨ Demo unary RPC completed successfully!');
    console.log('='.repeat(60));
  });
}

// Run the demo
getServerInfo();
