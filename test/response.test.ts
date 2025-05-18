import { Response } from "../src/response";
import { Event } from "../src/event";

describe("Response", () => {
  test("should create a Response from raw AMI data", () => {
    const rawResponseData = "Response: Success\r\nActionID: 123\r\nMessage: Command executed\r\n\r\n";
    const response = new Response(rawResponseData);
    
    expect(response).toBeInstanceOf(Response);
    expect(response.response).toBe("Success");
    expect(response.actionid).toBe("123");
    expect(response.message).toBe("Command executed");
    expect(response.events).toEqual([]);
  });

  test("isSuccess should return true for success responses", () => {
    const successResponse = new Response("Response: Success\r\nActionID: 123\r\n\r\n");
    const errorResponse = new Response("Response: Error\r\nActionID: 123\r\n\r\n");
    
    expect(successResponse.isSuccess()).toBe(true);
    expect(errorResponse.isSuccess()).toBe(false);
  });

  test("willFollow should identify responses that will be followed by events", () => {
    const followsResponse = new Response("Response: Success\r\nActionID: 123\r\nMessage: Events will follow\r\n\r\n");
    const normalResponse = new Response("Response: Success\r\nActionID: 123\r\nMessage: Command executed\r\n\r\n");
    const noMessageResponse = new Response("Response: Success\r\nActionID: 123\r\n\r\n");
    
    expect(followsResponse.willFollow()).toBe(true);
    expect(normalResponse.willFollow()).toBe(false);
    expect(noMessageResponse.willFollow()).toBe(false);
  });

  test("asJson should return a JSON object with response properties and events", () => {
    const response = new Response("Response: Success\r\nActionID: 123\r\nMessage: Events will follow\r\n\r\n");
    const event = new Event("Event: Status\r\nActionID: 123\r\nChannel: SIP/1234\r\n\r\n");
    
    response.events.push(event);
    
    const json = response.asJson();
    
    expect(json).toHaveProperty("response", "Success");
    expect(json).toHaveProperty("message", "Events will follow");
    expect(json).toHaveProperty("events");
    expect(json.events.length).toBe(1);
    expect(json.events[0]).toHaveProperty("event", "Status");
    expect(json.events[0]).toHaveProperty("channel", "SIP/1234");
  });
}); 