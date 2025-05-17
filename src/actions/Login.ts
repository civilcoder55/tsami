import { Action } from "../action";

/**
 * Login Action for authenticating with the Asterisk Manager Interface.
 * Required as the first action when establishing a new AMI session.
 *
 * @extends Action
 */
export class Login extends Action {
  /** Username for authentication with AMI */
  protected readonly Username: string;
  /** Password for authentication with AMI */
  protected readonly Secret: string;

  /**
   * Creates a new Login action with the specified credentials.
   *
   * @param {string} username - AMI username
   * @param {string} secret - AMI password or secret
   */
  constructor(username: string, secret: string) {
    super("Login");
    this.Username = username;
    this.Secret = secret;
  }
}
