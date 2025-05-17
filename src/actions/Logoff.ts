import { Action } from "../action";

/**
 * Logoff Action for terminating an AMI session.
 * Closes the manager connection and stops event generation.
 *
 * @extends Action
 */
export class Logoff extends Action {
  /**
   * Creates a new Logoff action.
   */
  constructor() {
    super("Logoff");
  }
}
