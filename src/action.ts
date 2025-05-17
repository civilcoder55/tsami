import { Message } from "./message";

/**
 * Action ID generator function.
 * Implements a closure to maintain a sequential counter for generating unique Action IDs.
 * Ensures each action sent to Asterisk AMI has a unique identifier.
 */
const ActionUniqueId = (function () {
  let nextId = 0;
  return function () {
    return nextId++;
  };
})();

/**
 * Base action class for all AMI actions.
 * Represents a command to be sent to the Asterisk Manager Interface.
 * Every action sent to AMI extends this class to implement specific AMI operations.
 * Automatically assigns a unique ActionID to each instance for tracking responses.
 *
 * @extends Message
 */
export class Action extends Message {
  /** ActionID field for AMI - string representation of the ID */
  ActionID!: string;
  /** Internal unique identifier for tracking */
  protected id: number;
  /** The name of the action to be performed by AMI */
  protected Action!: string;

  /**
   * Creates a new Action with the specified name.
   * Automatically assigns a unique Action ID.
   *
   * @param {String} name - The action name (e.g., "Login", "Status", "Ping")
   */
  constructor(name: string) {
    super();
    this.id = ActionUniqueId();
    this.ActionID = String(this.id);
    this.Action = name;
  }
}
