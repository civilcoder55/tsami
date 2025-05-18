import { Action } from "../action";

/**
 * CustomAction for executing arbitrary AMI actions.
 * Allows dynamic creation of any AMI action not explicitly defined as a class.
 *
 * @extends Action
 */
export class CustomAction extends Action {
  /**
   * Creates a new custom AMI action with the specified name and parameters.
   *
   * @param {Object} options - Action configuration
   * @param {string} options.name - The name of the AMI action
   * @param {Record<string, string | number | boolean>} [options.params] - Optional parameters for the action
   */
  constructor({
    name,
    params,
  }: {
    name: string;
    params?: Record<string, any>;
  }) {
    super(name);
    if (params) {
      Object.assign(this, params);
    }
  }
}
