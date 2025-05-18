import { createLoggerHandler } from "../../src/utils/logger";
import { LogLevel } from "../../src/enums";

describe("Logger", () => {
  beforeEach(() => {
    // Create spies for console methods
    jest.spyOn(console, "error").mockImplementation();
    jest.spyOn(console, "warn").mockImplementation();
    jest.spyOn(console, "info").mockImplementation();
    jest.spyOn(console, "log").mockImplementation();
  });
  
  afterEach(() => {
    // Restore original console methods
    jest.restoreAllMocks();
  });

  test("should create a logger with default handlers", () => {
    const logger = createLoggerHandler(LogLevel.DEBUG);
    
    expect(logger).toHaveProperty("error");
    expect(logger).toHaveProperty("warn");
    expect(logger).toHaveProperty("info");
    expect(logger).toHaveProperty("debug");
  });

  test("should respect ERROR log level", () => {
    const logger = createLoggerHandler(LogLevel.ERROR);
    
    logger.error("Error message");
    logger.warn("Warning message");
    logger.info("Info message");
    logger.debug("Debug message");
    
    expect(console.error).toHaveBeenCalledWith("Error message");
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
  });

  test("should respect WARN log level", () => {
    const logger = createLoggerHandler(LogLevel.WARN);
    
    logger.error("Error message");
    logger.warn("Warning message");
    logger.info("Info message");
    logger.debug("Debug message");
    
    expect(console.error).toHaveBeenCalledWith("Error message");
    expect(console.warn).toHaveBeenCalledWith("Warning message");
    expect(console.info).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
  });

  test("should respect INFO log level", () => {
    const logger = createLoggerHandler(LogLevel.INFO);
    
    logger.error("Error message");
    logger.warn("Warning message");
    logger.info("Info message");
    logger.debug("Debug message");
    
    expect(console.error).toHaveBeenCalledWith("Error message");
    expect(console.warn).toHaveBeenCalledWith("Warning message");
    expect(console.info).toHaveBeenCalledWith("Info message");
    expect(console.log).not.toHaveBeenCalled();
  });

  test("should respect DEBUG log level", () => {
    const logger = createLoggerHandler(LogLevel.DEBUG);
    
    logger.error("Error message");
    logger.warn("Warning message");
    logger.info("Info message");
    logger.debug("Debug message");
    
    expect(console.error).toHaveBeenCalledWith("Error message");
    expect(console.warn).toHaveBeenCalledWith("Warning message");
    expect(console.info).toHaveBeenCalledWith("Info message");
    expect(console.log).toHaveBeenCalledWith("Debug message");
  });

  test("should use custom logger when provided", () => {
    const customLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn()
    };
    
    const logger = createLoggerHandler(LogLevel.DEBUG, customLogger);
    
    logger.error("Error message");
    logger.warn("Warning message");
    logger.info("Info message");
    logger.debug("Debug message");
    
    expect(customLogger.error).toHaveBeenCalledWith("Error message");
    expect(customLogger.warn).toHaveBeenCalledWith("Warning message");
    expect(customLogger.info).toHaveBeenCalledWith("Info message");
    expect(customLogger.debug).toHaveBeenCalledWith("Debug message");
    
    // Console should not be used
    expect(console.error).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
    expect(console.log).not.toHaveBeenCalled();
  });
}); 