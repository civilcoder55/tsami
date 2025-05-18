import { Login } from "../src/actions/Login";
import { Logoff } from "../src/actions/Logoff";
import { Ping } from "../src/actions/Ping";
import { Hangup } from "../src/actions/Hangup";
import { Status } from "../src/actions/Status";
import { CoreShowChannels } from "../src/actions/CoreShowChannels";
import { CustomAction } from "../src/actions/CustomAction";

describe("AMI Actions", () => {
  describe("Login", () => {
    test("should create a Login action with username and password", () => {
      const username = "admin";
      const password = "secret";
      const login = new Login(username, password);
      
      expect(login).toBeInstanceOf(Login);
      const marshalled = login.marshall();
      
      expect(marshalled).toContain("Action: Login");
      expect(marshalled).toContain("Username: admin");
      expect(marshalled).toContain("Secret: secret");
    });
  });

  describe("Logoff", () => {
    test("should create a Logoff action", () => {
      const logoff = new Logoff();
      
      expect(logoff).toBeInstanceOf(Logoff);
      const marshalled = logoff.marshall();
      
      expect(marshalled).toContain("Action: Logoff");
    });
  });

  describe("Ping", () => {
    test("should create a Ping action", () => {
      const ping = new Ping();
      
      expect(ping).toBeInstanceOf(Ping);
      const marshalled = ping.marshall();
      
      expect(marshalled).toContain("Action: Ping");
    });
  });

  describe("Hangup", () => {
    test("should create a Hangup action with channel name", () => {
      const channel = "SIP/1234-00000123";
      const hangup = new Hangup(channel);
      
      expect(hangup).toBeInstanceOf(Hangup);
      const marshalled = hangup.marshall();
      
      expect(marshalled).toContain("Action: Hangup");
      expect(marshalled).toContain(`Channel: ${channel}`);
    });

    test("should create a Hangup action with channel name and cause", () => {
      const channel = "SIP/1234-00000123";
      const cause = "16";
      const hangup = new Hangup(channel, cause);
      
      expect(hangup).toBeInstanceOf(Hangup);
      const marshalled = hangup.marshall();
      
      expect(marshalled).toContain("Action: Hangup");
      expect(marshalled).toContain(`Channel: ${channel}`);
      expect(marshalled).toContain(`Cause: ${cause}`);
    });
  });

  describe("Status", () => {
    test("should create a Status action without channel", () => {
      const status = new Status();
      
      expect(status).toBeInstanceOf(Status);
      const marshalled = status.marshall();
      
      expect(marshalled).toContain("Action: Status");
      expect(marshalled).not.toContain("Channel:");
    });

    test("should create a Status action with channel name", () => {
      const channel = "SIP/1234-00000123";
      const status = new Status(channel);
      
      expect(status).toBeInstanceOf(Status);
      const marshalled = status.marshall();
      
      expect(marshalled).toContain("Action: Status");
      expect(marshalled).toContain(`Channel: ${channel}`);
    });
  });

  describe("CoreShowChannels", () => {
    test("should create a CoreShowChannels action", () => {
      const coreShowChannels = new CoreShowChannels();
      
      expect(coreShowChannels).toBeInstanceOf(CoreShowChannels);
      const marshalled = coreShowChannels.marshall();
      
      expect(marshalled).toContain("Action: CoreShowChannels");
    });
  });

  describe("CustomAction", () => {
    test("should create a custom action with specified name", () => {
      const actionName = "CustomActionName";
      const customAction = new CustomAction({ name: actionName });
      
      expect(customAction).toBeInstanceOf(CustomAction);
      const marshalled = customAction.marshall();
      
      expect(marshalled).toContain(`Action: ${actionName}`);
    });

    test("should add parameters to custom action", () => {
      const actionName = "CustomActionName";
      const customAction = new CustomAction({ 
        name: actionName,
        params: {
          Param1: "Value1",
          Param2: "Value2"
        }
      });
      
      const marshalled = customAction.marshall();
      
      expect(marshalled).toContain(`Action: ${actionName}`);
      expect(marshalled).toContain("Param1: Value1");
      expect(marshalled).toContain("Param2: Value2");
    });
  });
}); 