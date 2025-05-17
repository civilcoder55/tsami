/**
 * Asterisk Manager Interface (AMI) Client Library
 *
 * A TypeScript implementation for interacting with Asterisk PBX through the Asterisk Manager Interface protocol.
 *
 * Key components:
 * - Ami: The main client class for AMI connections
 * - Action: Base class for all AMI commands (actions)
 * - Event: Representation of asynchronous events from Asterisk
 * - Message: Core message handling and formatting
 * - Response: Server responses to actions
 * - actions: Common predefined AMI actions
 */
export * from "./ami";
export * from "./action";
export * from "./event";
export * from "./message";
export * from "./response";
export * as actions from "./actions";
