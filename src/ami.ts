import * as net from "net";
import { EventEmitter } from "events";
import { Action } from "./action";
import { Response } from "./response";
import { Event } from "./event";
import * as actions from "./actions";
import { AmiClientOptions, Logger } from "./interfaces";
import { ResponseCallback } from "./types";
import { AmiEvents, AmiSocketEvents } from "./enums";
import { createLoggerHandler } from "./utils/logger";
import { inspect } from "util";

export declare interface AMI {
  on(event: AmiSocketEvents.Connected, listener: () => void): this;
  on(event: AmiSocketEvents.Error, listener: (error: Error) => void): this;
  on(
    event: AmiSocketEvents.Closed,
    listener: (hadError: boolean) => void
  ): this;
  on(event: AmiSocketEvents.Timeout, listener: () => void): this;
  on(event: AmiSocketEvents.Ended, listener: () => void): this;
  on(event: AmiEvents.Event, listener: (event: Event) => any): this;
  on(event: AmiEvents.InvalidTcpPeer, listener: (data: string) => void): this;
  on(event: AmiEvents.LoginIncorrect, listener: () => void): this;
  on(event: AmiEvents.Connected, listener: () => void): this;
  on(event: AmiEvents.RawMessage, listener: (message: string) => void): this;
  on(
    event: AmiEvents.RawResponse,
    listener: (response: Response) => void
  ): this;
  on(event: AmiEvents.RawEvent, listener: (event: Event) => void): this;
}

/**
 * Client for interfacing with the Asterisk Manager Interface (AMI).
 *
 * @extends EventEmitter
 */
export class AMI extends EventEmitter {
  private readonly logger: Logger;
  private connected: boolean = false;
  private readonly EOL: string = "\r\n";
  private readonly EOM: string = this.EOL + this.EOL;
  private readonly connectionMessage: string =
    "Asterisk Call Manager/.*" + this.EOL;
  private received: string = "";
  private readonly responses: { [key: string]: Response } = {};
  private readonly callbacks: { [key: string]: ResponseCallback } = {};
  private socket: net.Socket | undefined;
  private readonly MAX_BUFFER_SIZE = 1024 * 1024; // 1MB

  /**
   * Creates a new AMI client instance with the specified AMI configuration.
   * Sets up event handlers and prepares for connection.
   *
   * @param {AmiClientOptions} amiClientOptions - Configuration for the AMI connection
   */
  constructor(private readonly amiClientOptions: AmiClientOptions) {
    super();
    this.logger = createLoggerHandler(
      amiClientOptions.logLevel || 0,
      amiClientOptions.logger
    );

    this.setupEventHandlers();
  }

  /**
   * Sets up event handlers for the AMI client.
   *
   * @private
   */
  private setupEventHandlers(): void {
    this.on(AmiEvents.RawMessage, this.onRawMessage);
    this.on(AmiEvents.RawResponse, this.onRawResponse);
    this.on(AmiEvents.RawEvent, this.onRawEvent);
  }

  /**
   * Processes raw message data from AMI and dispatches to appropriate handlers.
   * Determines the message type and emits the corresponding event.
   *
   * @param {string} data - Raw message text from AMI
   * @fires AmiEvents.RawEvent
   * @fires AmiEvents.RawResponse
   */
  onRawMessage(data: string): void {
    this.logger.debug(
      "-----------------------Building raw message-----------------------"
    );
    this.logger.debug(data);
    this.logger.debug(
      "------------------------------------------------------------------"
    );

    if (data.match(/^Event: /)) {
      this.emit(AmiEvents.RawEvent, new Event(data));
      return;
    }

    if (data.match(/^Response: /)) {
      this.emit(AmiEvents.RawResponse, new Response(data));
      return;
    }

    this.logger.warn("Discarded: |" + data + "|");
  }

  /**
   * Handles incoming events from the AMI.
   * Processes events and either adds them to an existing response or emits them as standalone events.
   *
   * @param {Event} event - The event object received from AMI
   * @fires Event
   * @fires Event[EventName]
   */
  onRawEvent(event: Event): void {
    this.logger.debug("Got event: " + inspect(event));

    if (
      event.actionid &&
      this.responses[event.actionid] &&
      this.callbacks[event.actionid]
    ) {
      this.responses[event.actionid].events.push(event);
      if (event.completed()) {
        this.callbacks[event.actionid](this.responses[event.actionid]);
        delete this.callbacks[event.actionid];
        delete this.responses[event.actionid];
      }

      return;
    }

    this.emit(AmiEvents.Event, event);
  }

  /**
   * Handles response messages from the AMI.
   * Either buffers the response for future events or completes the operation immediately.
   *
   * @param {Response} response - The response object received from AMI
   */
  onRawResponse(response: Response): void {
    this.logger.debug("Got response: " + inspect(response));

    if (response.willFollow()) {
      this.responses[response.actionid] = response;

      return;
    }

    if (this.callbacks[response.actionid]) {
      this.callbacks[response.actionid](response);
      delete this.callbacks[response.actionid];
      delete this.responses[response.actionid];
    }
  }

  /**
   * Handles raw data coming from the socket connection.
   * Buffers incomplete messages and processes complete ones.
   *
   * @param {string} data - Raw data chunk from the socket
   * @fires AmiEvents.RawMessage
   */
  onData(data: string): void {
    this.logger.debug("-----------------------Got data-----------------------");
    this.logger.debug(data);
    this.logger.debug("------------------------------------------------------");

    this.received += data;

    if (this.received.length > this.MAX_BUFFER_SIZE) {
      this.logger.error(
        "Buffer overflow: Received data exceeds maximum allowed size. Resetting buffer."
      );
      this.received = "";
      this.socket?.destroy();
      return;
    }

    let eomPos: number;

    while ((eomPos = this.received.indexOf(this.EOM)) !== -1) {
      const msg = this.received.slice(0, eomPos); // get the message from beginning to end of message
      this.emit(AmiEvents.RawMessage, msg);

      let startPos = eomPos + this.EOM.length;

      while (
        startPos < this.received.length &&
        (this.received[startPos] === "\r" || this.received[startPos] === "\n")
      ) {
        startPos++;
      }

      if (startPos > 0) {
        this.received = this.received.slice(startPos);
      }
    }
  }

  /**
   * Processes the initial message from the Asterisk server.
   * Verifies the server is a valid AMI endpoint and attempts login.
   *
   * @param {string} data - The message from the server
   * @fires AmiEvents.InvalidTcpPeer
   * @fires AmiEvents.Connected
   * @fires AmiEvents.LoginIncorrect
   */
  onConnectionMessage(data: string): void {
    this.logger.debug("Got initial message: " + data);

    if (!data.match(new RegExp(this.connectionMessage, ""))) {
      this.emit(AmiEvents.InvalidTcpPeer, data);
      return;
    }

    // if valid ami endpoint, start listening for data
    this.socket!.on("data", (data: Buffer) => {
      this.onData(data.toString());
    });

    // send login action
    this.send(
      new actions.Login(
        this.amiClientOptions.username,
        this.amiClientOptions.password
      ),
      (response: Response) => {
        if (response.isSuccess()) {
          this.emit(AmiEvents.Connected);
        } else {
          this.emit(AmiEvents.LoginIncorrect);
        }
      }
    );
  }

  /**
   * Closes the connection to the AMI server.
   * Performs a clean disconnection by sending Logoff action if connected.
   */
  async close(): Promise<void> {
    if (this.connected) {
      await this.asyncSend(new actions.Logoff());
      this.logger.info("Logged out");
    }

    this.logger.info("Closing socket connection");

    this.closeSocket();
  }

  /**
   * Opens a connection to the AMI server.
   * Establishes a socket connection and sets up event handlers.
   */
  open(): void {
    this.logger.debug("Opening connection");
    this.received = "";
    this.initializeSocket();
  }

  closeSocket(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      if (!this.socket.destroyed) {
        this.socket.end();
      }
    }
  }

  /**
   * Sets up the underlying socket connection with appropriate event handlers.
   * Configures event handlers for all socket lifecycle events.
   *
   * @private
   */
  private initializeSocket(): void {
    this.closeSocket(); // end old socket if it exists

    this.logger.debug("Initializing socket");

    this.socket = new net.Socket();
    this.socket.setEncoding("utf8");

    this.socket.on("connect", () => {
      this.logger.debug("Socket connected");
      this.connected = true;

      this.emit(AmiSocketEvents.Connected);
    });

    this.socket.on("error", (error: Error) => {
      this.logger.debug("Socket error: " + error);
      this.emit(AmiSocketEvents.Error, error);
    });

    this.socket.on("close", (hadError: boolean) => {
      this.logger.debug("Socket closed");
      this.connected = false;
      this.emit(AmiSocketEvents.Closed, hadError);
    });

    this.socket.on("timeout", () => {
      this.logger.debug("Socket timeout");
      this.emit(AmiSocketEvents.Timeout);
    });

    this.socket.on("end", () => {
      this.logger.debug("Socket ended");
      this.emit(AmiSocketEvents.Ended);
    });

    this.socket.once("data", (data: Buffer) => {
      this.onConnectionMessage(data.toString());
    });

    this.socket.connect(this.amiClientOptions.port, this.amiClientOptions.host);
  }

  /**
   * Sends an action to the AMI server.
   * Registers a callback to be called when a response is received.
   *
   * @param {Action} action - The action to send
   * @param {ResponseCallback} callback - Function to call with the response
   */
  send(action: Action, callback: ResponseCallback): void {
    this.logger.debug("Sending: " + inspect(action));

    if (!this.connected) {
      throw new Error("Not connected to AMI");
    }

    this.callbacks[action.ActionID] = callback;
    this.responses[action.ActionID] = {} as Response;
    this.socket!.write(action.marshall());
  }

  /**
   * Sends an action to the AMI and returns a Promise for the response.
   * Promisified version of the send method for use with async/await.
   *
   * @param {Action} action - The action to send
   * @returns {Promise<Response>} Promise that resolves with the response
   */
  asyncSend(action: Action): Promise<Response> {
    return new Promise((resolve, reject) => {
      try {
        this.send(action, (response) => resolve(response));
      } catch (error) {
        reject(error);
      }
    });
  }
}
