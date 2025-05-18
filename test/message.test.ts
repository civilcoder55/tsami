import { Message } from "../src/message";

describe("Message", () => {
  let message: Message;

  beforeEach(() => {
    message = new Message();
  });

  test("should create a new Message instance", () => {
    expect(message).toBeInstanceOf(Message);
  });

  test("marshall should serialize the message to AMI format", () => {
    message["TestKey"] = "TestValue";
    message["AnotherKey"] = "AnotherValue";
    
    const result = message.marshall();
    
    expect(result).toContain("TestKey: TestValue");
    expect(result).toContain("AnotherKey: AnotherValue");
    expect(result.endsWith("\r\n\r\n")).toBe(true);
  });

  test("marshall should handle variables correctly", () => {
    message["TestKey"] = "TestValue";
    message["variables"] = {
      var1: "value1",
      var2: "value2"
    };
    
    const result = message.marshall();
    
    expect(result).toContain("TestKey: TestValue");
    expect(result).toContain("Variable: var1=value1");
    expect(result).toContain("Variable: var2=value2");
    expect(result.endsWith("\r\n\r\n")).toBe(true);
  });

  test("unmarshall should parse AMI format into object properties", () => {
    const amiData = "Key1: Value1\r\nKey2: Value2\r\n\r\n";
    
    message.unmarshall(amiData);
    
    expect(message["key1"]).toBe("Value1");
    expect(message["key2"]).toBe("Value2");
  });

  test("unmarshall should handle variables correctly", () => {
    const amiData = "Key1: Value1\r\nVariable: var1=value1\r\nVariable: var2=value2\r\n\r\n";
    
    message.unmarshall(amiData);
    
    expect(message["key1"]).toBe("Value1");
    expect(message["variables"]["var1"]).toBe("value1");
    expect(message["variables"]["var2"]).toBe("value2");
  });

  test("unmarshall should handle multi-colon lines", () => {
    const amiData = "Key1: Value1\r\nDescription: This: is: a: complex: value\r\n\r\n";
    
    message.unmarshall(amiData);
    
    expect(message["key1"]).toBe("Value1");
    expect(message["description"]).toBe("This: is: a: complex: value");
  });

  test("asJson should return a plain object with message properties", () => {
    message["TestKey"] = "TestValue";
    message["AnotherKey"] = "AnotherValue";
    message["variables"] = {
      var1: "value1"
    };
    
    const json = message.asJson();
    
    expect(json).toEqual({
      TestKey: "TestValue",
      AnotherKey: "AnotherValue"
    });
    expect(json).not.toHaveProperty("variables");
    expect(json).not.toHaveProperty("EOL");
  });
}); 