import { Event } from "../src/event";

describe("Event", () => {
  test("should create an Event from raw AMI data", () => {
    const rawEventData = "Event: Hangup\r\nChannel: SIP/1234-00000123\r\nCallerIDNum: 1234\r\n\r\n";
    const event = new Event(rawEventData);
    
    expect(event).toBeInstanceOf(Event);
    expect(event.event).toBe("Hangup");
    expect(event["channel"]).toBe("SIP/1234-00000123");
    expect(event["calleridnum"]).toBe("1234");
  });

  test("should identify completed events", () => {
    const completedEvent = new Event("Event: StatusComplete\r\nActionID: 123\r\n\r\n");
    const incompleteEvent = new Event("Event: Status\r\nActionID: 123\r\n\r\n");
    
    expect(completedEvent.completed()).toBe(true);
    expect(incompleteEvent.completed()).toBe(false);
  });

  test("should identify eventlist completion", () => {
    const completed = new Event("Event: PeerlistComplete\r\nEventList: Complete\r\nActionID: 123\r\n\r\n");
    const incomplete = new Event("Event: PeerEntry\r\nEventList: start\r\nActionID: 123\r\n\r\n");
    const noEventList = new Event("Event: Hangup\r\nActionID: 123\r\n\r\n");
    
    expect(completed.eventlistCompleted()).toBe(true);
    expect(incomplete.eventlistCompleted()).toBe(false);
    expect(noEventList.eventlistCompleted()).toBe(false);
  });

  test("completed() should return true for both direct completion and eventlist completion", () => {
    const directComplete = new Event("Event: StatusComplete\r\nActionID: 123\r\n\r\n");
    const eventListComplete = new Event("Event: PeerlistComplete\r\nEventList: Complete\r\nActionID: 123\r\n\r\n");
    
    expect(directComplete.completed()).toBe(true);
    expect(eventListComplete.completed()).toBe(true);
  });

  test("should convert to JSON format", () => {
    const event = new Event("Event: Hangup\r\nChannel: SIP/1234-00000123\r\nCallerIDNum: 1234\r\n\r\n");
    const json = event.asJson();
    
    expect(json).toHaveProperty("event", "Hangup");
    expect(json).toHaveProperty("channel", "SIP/1234-00000123");
    expect(json).toHaveProperty("calleridnum", "1234");
    expect(json).not.toHaveProperty("EOL");
    expect(json).not.toHaveProperty("variables");
  });
}); 