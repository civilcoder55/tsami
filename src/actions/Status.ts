import { Action } from "../action";

/**
 * Status Action for obtaining detailed information about channels.
 * When used without a channel parameter, returns information on all active channels.
 * When specified with a channel, returns detailed status for only that channel.
 *
 * @extends Action
 */
export class Status extends Action {
  /** Optional channel name to get status for (omit for all channels) */
  protected readonly Channel?: string;
  /** Optional variables to include in the response */
  protected readonly Variables?: string;
  /** Optional flag to include all variables */
  protected readonly AllVariables?: boolean;

  /**
   * Creates a new Status action.
   *
   * @param {string} channel - The name of the channel to get status for
   * @param {string[]} variables - The variables to include in the response
   * @param {boolean} allVariables - Whether to include all variables
   */
  constructor(channel?: string, variables?: string[], allVariables?: boolean) {
    super("Status");

    if (channel) this.Channel = channel;
    if (variables) this.Variables = variables.join(",");

    if (allVariables !== undefined) this.AllVariables = !!allVariables;
  }
}
