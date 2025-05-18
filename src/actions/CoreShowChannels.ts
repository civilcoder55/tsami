import { Action } from "../action";

/**
 * CoreShowChannels Action for listing all active channels.
 * Provides detailed information about all currently active channels in the system.
 *
 * @extends Action
 */
export class CoreShowChannels extends Action {
  /**
   * Creates a new CoreShowChannels action.
   */
  constructor() {
    super("CoreShowChannels");
  }
}
