import { LogLevel } from "../enums";
import { Logger } from "../interfaces";

/**
 * Logging helper that respects the configured log level.
 * Only logs messages if the current log level is sufficient.
 *
 * @param {number} minLevel - Minimum log level required to output this message
 * @param {number} logLevel - Current log level
 * @param {Function} fun - Logging function to use
 * @param {string} msg - Message to log
 */
function logMessage(
  minLevel: number,
  logLevel: number,
  fun: (msg: string) => void,
  msg: string
) {
  if (logLevel >= minLevel) fun(msg);
}

/**
 * Creates a logger handler with default console logging if no logger is provided.
 *
 * @returns {Logger}
 */
export function createLoggerHandler(logLevel: number, logger?: Logger): Logger {
  return {
    error: (msg: string) =>
      logMessage(LogLevel.ERROR, logLevel, logger?.error || console.error, msg),
    warn: (msg: string) =>
      logMessage(LogLevel.WARN, logLevel, logger?.warn || console.warn, msg),
    info: (msg: string) =>
      logMessage(LogLevel.INFO, logLevel, logger?.info || console.info, msg),
    debug: (msg: string) =>
      logMessage(LogLevel.DEBUG, logLevel, logger?.debug || console.log, msg),
  };
}
