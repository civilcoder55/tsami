import { Response } from "./response";

/**
 * Callback type for handling AMI responses.
 * Invoked when a response is received for a sent action.
 */
export type ResponseCallback = (response: Response) => void;
