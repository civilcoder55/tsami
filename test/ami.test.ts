import { AMI } from "../src/ami";
import { AmiClientOptions } from "../src/interfaces";
import * as net from "net";
import { Event } from "../src/event";
import { Response } from "../src/response";
import { Action } from "../src/action";
import { AmiEvents, AmiSocketEvents } from "../src/enums";

// Mock the net module
jest.mock("net");

const mockSocket = {
  on: jest.fn(),
  once: jest.fn(),
  connect: jest.fn(),
  end: jest.fn(),
  destroy: jest.fn(),
  write: jest.fn(),
  setEncoding: jest.fn(),
  removeAllListeners: jest.fn(),
  destroyed: false,
};

// Cast the mocked net.Socket to the mockSocket type
const mockNet = net as jest.Mocked<typeof net>;
mockNet.Socket.mockReturnValue(mockSocket as any);

const mockAmiClientOptions: AmiClientOptions = {
  host: "localhost",
  port: 5038,
  username: "testuser",
  password: "testpassword",
};

describe("AMI", () => {
  let ami: AMI;

  beforeEach(() => {
    ami = new AMI(mockAmiClientOptions);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("constructor should initialize with options and setup event handlers", () => {
    expect(ami).toBeInstanceOf(AMI);
    // Check if setupEventHandlers was called (indirectly by checking listeners)
    expect((ami as any).eventNames().length).toBeGreaterThan(0);
  });

  test("open should initialize and connect the socket", () => {
    ami.open();
    expect(mockNet.Socket).toHaveBeenCalledTimes(1);
    expect(mockSocket.setEncoding).toHaveBeenCalledWith("utf8");
    expect(mockSocket.on).toHaveBeenCalledWith("connect", expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith("error", expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith("close", expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith("timeout", expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith("end", expect.any(Function));
    expect(mockSocket.once).toHaveBeenCalledWith("data", expect.any(Function));
    expect(mockSocket.connect).toHaveBeenCalledWith(
      mockAmiClientOptions.port,
      mockAmiClientOptions.host
    );
  });

  test("close should logoff and end the socket if connected", async () => {
    ami.open();
    // Simulate being connected
    (ami as any).connected = true;
    // Mock asyncSend to resolve immediately
    (ami as any).asyncSend = jest.fn().mockResolvedValue({});

    await ami.close();

    expect((ami as any).asyncSend).toHaveBeenCalled();
    expect(mockSocket.removeAllListeners).toHaveBeenCalled();
    expect(mockSocket.end).toHaveBeenCalled();
  });

  test("close should only end the socket if not connected", async () => {
    ami.open();
    // Simulate not being connected
    (ami as any).connected = false;
    // Mock asyncSend to resolve immediately
    (ami as any).asyncSend = jest.fn().mockResolvedValue({});

    await ami.close();

    expect((ami as any).asyncSend).not.toHaveBeenCalled();
    expect(mockSocket.removeAllListeners).toHaveBeenCalled();
    expect(mockSocket.end).toHaveBeenCalled();
  });

  test("onRawMessage should emit RawEvent for event messages", () => {
    const spy = jest.spyOn(ami, "emit");
    const eventMsg = "Event: TestEvent\r\nActionId: 123\r\nSome: Value";

    (ami as any).onRawMessage(eventMsg);

    expect(spy).toHaveBeenCalledWith(AmiEvents.RawEvent, expect.any(Event));
  });

  test("onRawMessage should emit RawResponse for response messages", () => {
    const spy = jest.spyOn(ami, "emit");
    const responseMsg =
      "Response: Success\r\nActionId: 123\r\nMessage: Command executed";

    (ami as any).onRawMessage(responseMsg);

    expect(spy).toHaveBeenCalledWith(
      AmiEvents.RawResponse,
      expect.any(Response)
    );
  });

  test("onRawMessage should log warnings for unrecognized messages", () => {
    const warnSpy = jest
      .spyOn((ami as any).logger, "warn")
      .mockImplementation();
    const unknownMsg = "Unknown: Format\r\nSome: Value";

    (ami as any).onRawMessage(unknownMsg);

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(unknownMsg));
  });

  test("onRawEvent should add events to existing responses if actionid matches", () => {
    const event = new Event("Event: TestEvent\r\nActionId: 123");
    const mockResponse = { events: [], actionid: "123" };
    const mockCallback = jest.fn();

    (ami as any).responses = { "123": mockResponse };
    (ami as any).callbacks = { "123": mockCallback };

    (ami as any).onRawEvent(event);

    expect(mockResponse.events).toContain(event);
  });

  test("onRawEvent should complete the response if event indicates completion", () => {
    const event = new Event(
      "Event: TestEvent\r\nActionId: 123\r\nEventList: Complete"
    );
    const mockResponse = { events: [], actionid: "123" };
    const mockCallback = jest.fn();

    (ami as any).responses = { "123": mockResponse };
    (ami as any).callbacks = { "123": mockCallback };

    jest.spyOn(event, "completed").mockReturnValue(true);

    (ami as any).onRawEvent(event);

    expect(mockCallback).toHaveBeenCalledWith(mockResponse);
    expect((ami as any).callbacks["123"]).toBeUndefined();
    expect((ami as any).responses["123"]).toBeUndefined();
  });

  test("onRawEvent should emit Event if not associated with a response", () => {
    const event = new Event("Event: Test\r\nSome: Value");
    const spy = jest.spyOn(ami, "emit");

    (ami as any).onRawEvent(event);

    expect(spy).toHaveBeenCalledWith(AmiEvents.Event, event);
    expect(spy).toHaveBeenCalledWith("TestEvent", event);
  });

  test("onRawResponse should buffer response if more events will follow", () => {
    const response = new Response(
      "Response: Success\r\nActionId: 123\r\nEventList: start"
    );

    jest.spyOn(response, "willFollow").mockReturnValue(true);

    (ami as any).onRawResponse(response);

    expect((ami as any).responses["123"]).toBe(response);
  });

  test("onRawResponse should complete immediately if no events will follow", () => {
    const response = new Response("Response: Success\r\nActionId: 123");
    const mockCallback = jest.fn();

    (ami as any).callbacks = { "123": mockCallback };
    jest.spyOn(response, "willFollow").mockReturnValue(false);

    (ami as any).onRawResponse(response);

    expect(mockCallback).toHaveBeenCalledWith(response);
    expect((ami as any).callbacks["123"]).toBeUndefined();
  });

  test("onData should buffer incomplete messages", () => {
    const data = "Event: TestEvent\r\nActionId: 123";

    (ami as any).onData(data);

    expect((ami as any).received).toBe(data);
  });

  test("onData should process complete messages", () => {
    const spy = jest.spyOn(ami, "emit");
    const data = "Event: TestEvent\r\nActionId: 123\r\n\r\n";

    (ami as any).onData(data);

    expect(spy).toHaveBeenCalledWith(
      AmiEvents.RawMessage,
      "Event: TestEvent\r\nActionId: 123"
    );
    expect((ami as any).received).toBe("");
  });

  test("onData should handle multiple complete messages", () => {
    const spy = jest.spyOn(ami, "emit");
    const data = "Event: Event1\r\n\r\nEvent: Event2\r\n\r\n";

    (ami as any).onData(data);

    expect(spy).toHaveBeenCalledWith(AmiEvents.RawMessage, "Event: Event1");
    expect(spy).toHaveBeenCalledWith(AmiEvents.RawMessage, "Event: Event2");
    expect((ami as any).received).toBe("");
  });

  test("onConnectionMessage should emit InvalidTcpPeer for invalid AMI endpoint", () => {
    const spy = jest.spyOn(ami, "emit");
    const data = "Invalid server";

    (ami as any).socket = mockSocket;
    (ami as any).onConnectionMessage(data);

    expect(spy).toHaveBeenCalledWith(AmiEvents.InvalidTcpPeer, data);
  });

  test("send should format and send action to the server", () => {
    ami.open();
    (ami as any).connected = true;
    const mockAction = new Action("Test");
    mockAction.ActionID = "123";
    const callback = jest.fn();

    (ami as any).socket = mockSocket;
    ami.send(mockAction, callback);

    expect(mockSocket.write).toHaveBeenCalledWith(
      "ActionID: 123\r\nAction: Test\r\n\r\n"
    );
    expect((ami as any).callbacks["123"]).toBe(callback);
  });

  test("asyncSend should return a Promise that resolves with response", async () => {
    ami.open();
    (ami as any).connected = true;

    const mockAction = new Action("Test");
    mockAction.ActionID = "123";
    const mockResponse = new Response("Response: Success\r\nActionId: 123");

    (ami as any).socket = mockSocket;

    mockSocket.write.mockImplementation(() => {
      setTimeout(() => {
        (ami as any).callbacks["123"](mockResponse);
      }, 0);
      return true;
    });

    const result = await (ami as any).asyncSend(mockAction);

    expect(result).toBe(mockResponse);
    expect(mockSocket.write).toHaveBeenCalledWith(
      "ActionID: 123\r\nAction: Test\r\n\r\n"
    );
  });
});
