import { Message } from "./message";
import { Event } from "./event";

/**
 * Represents a response message from the Asterisk Manager Interface.
 * Responses are sent by Asterisk in reply to Action requests.
 * May include a series of events depending on the action type.
 *
 * @extends Message
 */
export class Response extends Message {
  /** Status of the response (e.g., "Success", "Error", "Follows") */
  response!: string;
  /** ID of the action that triggered this response */
  actionid!: string;
  /** Additional information about the response */
  message?: string;
  /** Collection of events associated with this response */
  events: Event[];

  /**
   * Creates a new Response by parsing the provided AMI message data.
   * Initializes an empty events array for collecting associated events.
   *
   * @param {String} data - Raw response message from AMI
   */
  constructor(data: string) {
    super();
    this.events = [];
    this.unmarshall(data);
  }

  isSuccess(): boolean {
    return this.response === "Success";
  }

  /**
   * Determines if this response will be followed by additional events.
   * Used to identify responses that trigger a sequence of events.
   *
   * @returns {boolean} True if additional events will follow this response, false otherwise
   */
  willFollow(): boolean {
    return !!this.message && this.message.toLowerCase().indexOf("follow") !== -1;
  }

  /**
   * Converts the response to a JSON-serializable object including associated events.
   * Extends the base Message.asJson() to include events in the output.
   *
   * @returns {Record<string, any>} A plain JavaScript object with response properties and events
   */
  asJson(): Record<string, any> {
    const {
      events,
      // response,
      actionid,
      // message,
      EOL,
      variables,
      ...params
    } = this;
    return {
      ...params,
      events: this.events.map((event) => event.asJson()),
    };
  }
}
