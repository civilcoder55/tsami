import { Message } from "./message";

/**
 * Represents an asynchronous event received from the Asterisk Manager Interface.
 * Events are messages sent from Asterisk to notify about system changes or responses to actions.
 * They can be standalone or part of a response to an action that requested event generation.
 *
 * @extends Message
 */
export class Event extends Message {
  /** The name of the event (e.g., "Hangup", "Dial", "Registry") */
  name!: string;
  /** The type of event (e.g., "Hangup", "Dial", "Registry") */
  event!: string;
  /** Indicates if this event is part of an event list and its status */
  eventlist?: string;
  /** Associated Action ID if this event was generated in response to an action */
  actionid?: string;

  /**
   * Creates a new Event by parsing the provided AMI message data.
   *
   * @param {String} data - Raw event message from AMI
   */
  constructor(data: string) {
    super();
    this.unmarshall(data);
  }

  /**
   * Determines if this event represents a completion event.
   * Used to identify if a sequence of related events has finished.
   *
   * @returns {boolean} True if this is a completion event, false otherwise
   */
  completed(): boolean {
    return (
      new RegExp(`Complete`, "i").test(this.event) || this.eventlistCompleted()
    );
  }

  /**
   * Determines if this event completes an event list sequence.
   * Used when an action results in multiple events being sent back.
   *
   * @returns {boolean} True if this event completes an event list, false otherwise
   */
  eventlistCompleted(): boolean {
    if (!this.eventlist) return false;

    return (
      new RegExp(`Complete`, "i").test(this.eventlist) ||
      new RegExp(`DBGetResponse`, "i").test(this.eventlist)
    );
  }
}
