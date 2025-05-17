import { LogLevel } from "./enums";

/**
 * Interface for logging operations in the AMI client.
 */
export interface Logger {
  error: (msg: string) => void;
  warn: (msg: string) => void;
  info: (msg: string) => void;
  debug: (msg: string) => void;
}

/**
 * Configuration interface for establishing an AMI connection.
 * Contains all required parameters for connecting to an Asterisk server.
 */
export interface AmiClientOptions {
  /** Username for AMI authentication */
  username: string;
  /** Password for AMI authentication */
  password: string;
  /** Hostname or IP address of the Asterisk server */
  host: string;
  /** Port number for the AMI service (typically 5038) */
  port: number;
  /** Optional custom logger implementation */
  logger?: Logger;
  /** Optional logging verbosity level (0-3) */
  logLevel?: LogLevel;
}
