import { Action } from "../action";

/**
 * Hangup Action for terminating an active channel.
 * Allows administrative termination of calls in progress.
 *
 * @extends Action
 */
export class Hangup extends Action {
  /** The name of the channel to hang up */
  protected Channel: string;
  /** The numeric hangup cause. */
  protected Cause?: string;

  /**
   * Creates a new Hangup action.
   *
   * @param {string} channel - The name of the channel to hang up
   * @param {string} cause - The numeric hangup cause (e.g., "16" for Normal Clearing, "17" for User Busy)
   */
  constructor(channel: string, cause?: string) {
    super("Hangup");
    this.Channel = channel;
    this.Cause = cause;
  }
}
