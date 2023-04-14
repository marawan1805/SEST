import { SEST } from "../src/index";
import { ServiceAStateMachine } from "./ServiceAStateMachine";
import { ServiceBStateMachine } from "./ServiceBStateMachine";
import { ServiceCStateMachine } from "./ServiceCStateMachine";

describe("SEST", () => {
  let sest: SEST;

  beforeEach(() => {
    sest = new SEST({
      serviceA: ServiceAStateMachine,
      serviceB: ServiceBStateMachine,
      serviceC: ServiceCStateMachine,
    });
  });

  test("Basic event processing", () => {
    sest.sendEvent("serviceA", "start", { input: "data" });
    expect(sest.getState("serviceA")).toEqual({ status: "processing", data: { input: "data" } });

    sest.sendEvent("serviceB", "request", { request: "info" });
    expect(sest.getState("serviceB")).toEqual({ status: "waiting", data: { request: "info" } });

    sest.sendEvent("serviceC", "initialize", { config: "config data" });
    expect(sest.getState("serviceC")).toEqual({ status: "running", data: { config: "config data" } });
  });

  test("Fault injection", () => {
    sest.faultInjector.inject("serviceA", "temporaryFailure", { duration: 2000 });
    sest.sendEvent("serviceA", "start", { input: "data" });
    expect(sest.getState("serviceA")).toEqual({ status: "idle", data: null });

    sest.advanceTime(2000);
    sest.sendEvent("serviceA", "start", { input: "data" });
    expect(sest.getState("serviceA")).toEqual({ status: "processing", data: { input: "data" } });

    sest.reset();
    sest.faultInjector.inject("serviceB", "permanentFailure");
    sest.sendEvent("serviceB", "request", { request: "info" });
    expect(sest.getState("serviceB")).toEqual({ status: "idle", data: null });

    sest.reset();
    sest.faultInjector.inject("serviceC", "messageLoss", { lossPercentage: 50 });
    const originalState = sest.getState("serviceC");
    for (let i = 0; i < 10; i++) {
      sest.sendEvent("serviceC", "initialize", { config: "config data" });
      if (sest.getState("serviceC").status === "running") {
        break;
      }
    }
    expect(sest.getState("serviceC")).not.toEqual(originalState);
  });
});
