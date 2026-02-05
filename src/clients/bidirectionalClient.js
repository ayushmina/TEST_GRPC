const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const readline = require('readline');
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
console.log('💬 BIDIRECTIONAL STREAMING RPC CLIENT EXAMPLE');
console.log('='.repeat(60));
console.log('Demonstrating two-way streaming communication\n');

/**
 * Start bidirectional chat
 */
function startChat() {
  // Create bidirectional stream
  const call = client.ChatWithUsers();

  let messageCount = 0;
  let rl = null; // Initialize readline interface reference

  console.log('🔌 Connected to chat server!');
  console.log('📝 Type your messages (or "quit" to exit):\n');

  // Check if we should run in automated mode (for demonstration)
  const isAutomatedMode = process.argv.includes('--auto');

  // Handle incoming messages from server
  call.on('data', (message) => {
    const typeEmoji = {
      user: '👤',
      system: '🔧',
      notification: '🔔',
    };

    const emoji = typeEmoji[message.message_type] || '💬';

    console.log(`\n${emoji} [${message.username}] ${message.message}`);
    console.log(`   📅 ${new Date(message.timestamp).toLocaleTimeString()}`);

    // Prompt for next message if not in automated mode and readline is initialized
    if (!isAutomatedMode && rl) {
      rl.prompt();
    }
  });

  // Handle stream end
  call.on('end', () => {
    console.log('\n='.repeat(60));
    console.log('✨ Chat session ended.');
    console.log('='.repeat(60));
    if (rl) {
      rl.close();
    }
    process.exit(0);
  });

  // Handle errors
  call.on('error', (error) => {
    console.error('\n❌ Chat error:', error.message);
    if (rl) {
      rl.close();
    }
    process.exit(1);
  });

  if (isAutomatedMode) {
    // Automated mode - send predefined messages
    console.log('🤖 Running in automated mode...\n');

    const messages = [
      'Hello from the client!',
      'How are you today?',
      'This is a bidirectional stream demo.',
      'I can send and receive messages at the same time!',
      'Pretty cool, right?',
      'Thanks for chatting!',
    ];

    messages.forEach((msg, index) => {
      setTimeout(() => {
        messageCount++;
        console.log(`\n📤 You: ${msg}`);

        call.write({
          user_id: 123,
          username: 'ClientUser',
          message: msg,
          timestamp: new Date().toISOString(),
          message_type: 'user',
        });

        // End chat after last message
        if (index === messages.length - 1) {
          setTimeout(() => {
            console.log('\n👋 Ending chat session...');
            call.end();
          }, 3000);
        }
      }, index * 2000); // 2 seconds between messages
    });
  } else {
    // Interactive mode - read from console
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '\n📝 You: ',
    });

    rl.prompt();

    rl.on('line', (input) => {
      const message = input.trim();

      if (message.toLowerCase() === 'quit' || message.toLowerCase() === 'exit') {
        console.log('\n👋 Ending chat session...');
        call.end();
        return;
      }

      if (message) {
        messageCount++;

        call.write({
          user_id: 123,
          username: 'ClientUser',
          message: message,
          timestamp: new Date().toISOString(),
          message_type: 'user',
        });
      }

      rl.prompt();
    });

    rl.on('close', () => {
      console.log('\n👋 Goodbye!');
      call.end();
    });
  }
}

// Run chat
startChat();
