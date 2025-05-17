/**
 * Enumeration of possible connection event types.
 */
export enum AmiSocketEvents {
  /** Connection established successfully */
  Connected = "AMISocketConnected",
  /** Error occurred during connection */
  Error = "AMISocketError",
  /** Connection closed */
  Closed = "AMISocketClosed",
  /** Connection timed out */
  Timeout = "AMISocketTimeout",
  /** Connection ended */
  Ended = "AMISocketEnded",
}

export enum AmiEvents {
  /** Event received from AMI */
  Event = "AmiEvent",

  // Connection-related events

  /** Invalid AMI tcp peer connection */
  InvalidTcpPeer = "AmiInvalidTcpPeer",
  /** Login incorrect */
  LoginIncorrect = "AmiLoginIncorrect",
  /** Connected */
  Connected = "AmiConnected",

  // Message-related events
  /** Raw message received from AMI */
  RawMessage = "RawMessage",
  /** raw message parsed as response received from AMI */
  RawResponse = "RawResponse",
  /** raw message parsed as event received from AMI */
  RawEvent = "RawEvent",
}

/** Log level constants */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  NONE = -1,
}
