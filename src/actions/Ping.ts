import { Action } from "../action";

/**
 * Ping Action for testing connectivity with the Asterisk server.
 * Useful for keeping the connection alive and verifying server responsiveness.
 *
 * @extends Action
 */
export class Ping extends Action {
  /**
   * Creates a new Ping action.
   */
  constructor() {
    super("Ping");
  }
}
