import { Action } from "../src/action";

describe("Action", () => {
  test("should create an Action with a specific name", () => {
    const action = new Action("TestAction");
    expect(action).toBeInstanceOf(Action);
    expect(action["Action"]).toBe("TestAction");
  });

  test("should assign a unique ActionID to each Action", () => {
    const action1 = new Action("TestAction1");
    const action2 = new Action("TestAction2");
    
    expect(action1.ActionID).toBeDefined();
    expect(action2.ActionID).toBeDefined();
    expect(action1.ActionID).not.toBe(action2.ActionID);
  });

  test("should marshall to a properly formatted AMI action string", () => {
    const action = new Action("TestAction");
    action["Key1"] = "Value1";
    action["Key2"] = "Value2";
    
    const result = action.marshall();
    
    expect(result).toContain("Action: TestAction");
    expect(result).toContain(`ActionID: ${action.ActionID}`);
    expect(result).toContain("Key1: Value1");
    expect(result).toContain("Key2: Value2");
    expect(result.endsWith("\r\n\r\n")).toBe(true);
  });

  test("should properly include variables", () => {
    const action = new Action("TestAction");
    action["variables"] = {
      channel: "SIP/1234",
      context: "default"
    };
    
    const result = action.marshall();
    
    expect(result).toContain("Action: TestAction");
    expect(result).toContain(`ActionID: ${action.ActionID}`);
    expect(result).toContain("Variable: channel=SIP/1234");
    expect(result).toContain("Variable: context=default");
  });

  test("asJson should return a plain object with action properties", () => {
    const action = new Action("TestAction");
    action["Key1"] = "Value1";
    
    const json = action.asJson();
    
    expect(json).toHaveProperty("Action", "TestAction");
    expect(json).toHaveProperty("ActionID");
    expect(json).toHaveProperty("Key1", "Value1");
    expect(json).not.toHaveProperty("variables");
    expect(json).not.toHaveProperty("EOL");
  });
}); 