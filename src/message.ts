/**
 * Base message class that provides core functionality for AMI communication.
 * Handles serialization and deserialization of messages to and from AMI protocol format.
 * Serves as the foundation for Action, Response, and Event classes.
 */
export class Message {
  protected EOL: string = "\r\n";
  protected variables: Record<string, string> = {};
  [key: string]: any;

  /**
   * Converts the message to a JSON-serializable object.
   * Filters out internal properties and returns only AMI-relevant fields.
   *
   * @returns {Record<string, any>} A plain JavaScript object with message properties
   */
  asJson(): Record<string, any> {
    const { EOL, variables, ...properties } = this;
    return properties;
  }

  /**
   * Serializes the message into AMI protocol format.
   * Transforms object properties into "Key: Value" pairs separated by CRLF.
   * Variables are formatted as "Variable: key=value" entries.
   * Message is terminated with an extra CRLF.
   *
   * @returns {String} AMI-formatted message string ready for transmission
   */
  marshall(): string {
    const parts: string[] = [];

    for (const key in this) {
      if (
        key !== "variables" &&
        key !== "lines" &&
        key !== "EOL" &&
        key !== "id" &&
        typeof this[key] !== "function" &&
        this.hasOwnProperty(key)
      ) {
        parts.push(`${key}: ${this[key]}`);
      }
    }

    for (const key in this.variables) {
      parts.push(`Variable: ${key}=${this.variables[key]}`);
    }

    return parts.join(this.EOL) + this.EOL + this.EOL;
  }

  /**
   * Deserializes an AMI protocol message into a Message object.
   * Parses the raw text format from AMI into object properties.
   * Handles special cases for variables and multi-colon lines.
   *
   * @param {string} data Raw message data from AMI in text format
   * @returns {void}
   */
  unmarshall(data: string): void {
    const lines = data.split(this.EOL);

    for (const rawLine of lines) {
      if (rawLine.trim() === "") continue;

      const parts = rawLine.split(":");
      const key = parts.shift() || "";

      /*
       * This is so, because if this message is a response, specifically a response to
       * something like "ListCommands", the value of the keys, can contain the semicolon
       * ":", which happens to be token to be used to split keys and values. AMI does not
       * specify anything like an escape character, so we cant distinguish wether we're
       * dealing with a multi semicolon line or a standard key/value line.
       */
      let value: string = "";
      if (parts.length > 1) {
        value = parts.join(":");
      } else if (parts.length === 1) {
        value = parts[0];
      }

      const keySafe = key.trim().replace(/-/g, "_").toLowerCase();
      const valueSafe = value.trim();

      /*
       * SetVar contains Variable: header, but value should not include '=' in this case
       */
      if (keySafe.match(/variable/) !== null && valueSafe.match(/=/) !== null) {
        // variable: key=value
        const variable = valueSafe.split("="); // ["key", "value"]
        if (variable[1]) {
          this.variables[variable[0]] = variable[1]; // { key: "value" }
        }
      } else {
        this[keySafe] = valueSafe;
      }
    }
  }
}
