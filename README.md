# TSAMI

[![npm version](https://img.shields.io/npm/v/tsami.svg)](https://www.npmjs.com/package/tsami)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)

A TypeScript implementation of the Asterisk Manager Interface (AMI) client for Node.js, inspired by nami.

## Description

TSAMI is a robust, fully typed client library for interacting with the Asterisk PBX through the Asterisk Manager Interface protocol. It provides an elegant event-driven API for performing AMI operations, handling events, and managing connections in modern TypeScript applications.

## Features

- **Fully typed**: Complete TypeScript definitions for all AMI interactions
- **Event-driven architecture**: Based on Node.js EventEmitter
- **Promise support**: Modern async/await API
- **Connection management**: Handles automatic reconnection and error recovery
- **Built-in actions**: Includes common AMI actions like Login, Logoff, Ping, etc.
- **Custom actions support**: Create custom AMI actions with ease
- **Comprehensive event handling**: Process AMI events with typed handlers
- **Robust error handling**: Detailed error reporting and logging
- **Production-ready**: Buffer overflow protection and proper resource cleanup

## Installation

```bash
# Using npm
npm install tsami

# Using yarn
yarn add tsami
```

## Usage

### Basic Connection

```typescript
import { AMI, AmiEvents, AmiSocketEvents } from "tsami";

(async function main() {
  // Create AMI client
  const ami = new AMI({
    host: "localhost",
    port: 5038,
    username: "admin",
    password: "secret",
    logLevel: 2, // 0: none, 1: error, 2: warn, 3: info, 4: debug
  });

  // Set up event handlers
  ami.on(AmiSocketEvents.Connected, () => {
    console.log("Socket connected");
  });

  ami.on(AmiSocketEvents.Error, (error) => {
    console.error("Socket error:", error);
  });

  ami.on(AmiEvents.Connected, () => {
    console.log("Successfully authenticated with Asterisk");
  });

  ami.on(AmiEvents.Event, (event) => {
    console.log("Received event:", event.name);
  });

  // Connect to Asterisk server
  ami.open();
})();

// Close connection when done
async function shutdown() {
  await ami.close();
  console.log("Connection closed");
}
```

### Using Built-in Actions

```typescript
import { AMI, AmiEvents, actions } from "tsami";

(async function main() {
  const ami = new AMI({
    host: "localhost",
    port: 5038,
    username: "admin",
    password: "secret",
  });

  try {
    ami.open();

    // Wait for successful login
    await new Promise((resolve) => ami.once(AmiEvents.Connected, resolve));

    // Get channel information
    const response = await ami.asyncSend(new actions.CoreShowChannels());
    console.log("Active channels:", response.events.length - 1);

    // Loop through channels
    response.events.slice(0, response.events.length - 1).forEach((event) => {
      console.log(
        `Channel: ${event.channel} - State: ${event.channelstatestr}`
      );
    });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await ami.close();
  }
})();
```

### Using Custom Actions: you can send any action to the Asterisk server by creating a custom action instance and pass any parameters you want.

```typescript
import { AMI, AmiEvents actions } from "tsami";

(async function main() {
  const ami = new AMI({
    host: "localhost",
    port: 5038,
    username: "admin",
    password: "secret",
  });

  try {
    ami.open();
    await new Promise((resolve) => ami.once(AmiEvents.Connected, resolve));

    // Create a custom action
    const dialAction = new actions.CustomAction("Originate", {
      Channel: "SIP/1000",
      Context: "default",
      Exten: "1001",
      Priority: 1,
      Callerid: "TSAMI <1234>",
      Timeout: 30000,
    });

    const response = await ami.asyncSend(dialAction);
    console.log("Originate response:", response.response);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await ami.close();
  }
})();
```

## API Reference

### Main Classes

#### AMI

The primary client class for AMI connections.

```typescript
// Constructor
const ami = new AMI(options: AmiClientOptions);

// Methods
ami.open(): void;                              // Open the connection
ami.close(): Promise<void>;                    // Close the connection
ami.send(action: Action, callback: Function);  // Send an action with callback
ami.asyncSend(action: Action): Promise<Response>; // Send an action, returns Promise
```

#### Events

The AMI client emits various events during operation:

```typescript
// TCP Socket Events
ami.on(AmiSocketEvents.Connected, () => {}); // Socket connected
ami.on(AmiSocketEvents.Error, (error) => {}); // Socket error
ami.on(AmiSocketEvents.Closed, (hadError) => {}); // Socket closed
ami.on(AmiSocketEvents.Timeout, () => {}); // Socket timeout
ami.on(AmiSocketEvents.Ended, () => {}); // Socket ended

// AMI Events
ami.on(AmiEvents.Connected, () => {}); // Authenticated with AMI
ami.on(AmiEvents.Event, (event) => {}); // Received AMI event
ami.on(AmiEvents.LoginIncorrect, () => {}); // Authentication failed
ami.on(AmiEvents.RawMessage, (msg) => {}); // Raw AMI message
ami.on(AmiEvents.RawEvent, (event) => {}); // Raw AMI event before processing
ami.on(AmiEvents.RawResponse, (response) => {}); // Raw AMI response before processing
ami.on(AmiEvents.InvalidPeer, () => {}); // Invalid AMI socket connection
```

### Configuration Options

```typescript
interface AmiClientOptions {
  host: string; // Asterisk server hostname/IP
  port: number; // AMI port (default: 5038)
  username: string; // AMI username
  password: string; // AMI password
  logLevel?: number; // Log level (0: error, 1: warn, 2: info, 3: debug, -1: none) (default: 0)
  logger?: Logger; // Custom logger implementation
}
```

## Examples

### Listening for Specific Events

```typescript
import { AMI } from "tsami";

(async function main() {
  const ami = new AMI({
    host: "localhost",
    port: 5038,
    username: "admin",
    password: "secret",
  });

  // Listen for hangup events
  ami.on("HangupEvent", (event) => {
    console.log(
      `Call ended on channel ${event.channel} with cause: ${event.cause}`
    );
  });

  // Listen for new channels
  ami.on("NewchannelEvent", (event) => {
    console.log(
      `New channel ${event.channel} created with state ${event.channelstatestr}`
    );
  });

  ami.open();
})();
```

### Handling Reconnection

```typescript
import { AMI, AmiEvents, AmiSocketEvents } from "tsami";

(async function main() {
  const ami = new AMI({
    host: "localhost",
    port: 5038,
    username: "admin",
    password: "root",
  });

  ami.on(AmiSocketEvents.Closed, (hadError) => {
    console.log(`Connection closed${hadError ? " with error" : ""}`);

    if (hadError) {
      ami.open();
    }
  });

  ami.on(AmiEvents.Connected, () => {
    console.log("Successfully connected and authenticated");
  });

  ami.open();
})();
```

## Best Practices

1. **Always close connections** when they're no longer needed using `await ami.close()`
2. **Handle reconnection** gracefully for production applications
3. **Use try/catch blocks** with async/await for proper error handling
4. **Set appropriate log levels** based on your environment (lower in production)
5. **Subscribe to relevant events** rather than processing all AMI events
6. **Implement rate limiting** for actions to avoid overwhelming the Asterisk server
7. **Use typed events** for more maintainable code with TypeScript

## Testing

Run the test suite with:

```bash
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Changelog

See the [releases page](https://github.com/civilcoder55/tsami/releases) for a list of version changes.

## Contact/Support

- Create an [issue](https://github.com/civilcoder55/tsami/issues) for bug reports or feature requests
- Reach out to the [author](https://github.com/civilcoder55) for questions or support
