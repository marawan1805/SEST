// index.ts
import { EventSynchronizer } from "./core/EventSynchronizer";
import { VirtualClock } from "./core/VirtualClock";
import { FaultInjector } from "./core/FaultInjector";
import { StateMachine } from "./core/StateMachine";

export { StateMachine };

export class SEST {
  private eventSynchronizer: EventSynchronizer;
  private virtualClock: VirtualClock;
  faultInjector: FaultInjector;

  constructor(stateMachines: { [key: string]: StateMachine }) {
    this.eventSynchronizer = new EventSynchronizer(stateMachines);
    this.virtualClock = new VirtualClock();
    this.faultInjector = new FaultInjector(
      this.eventSynchronizer,
      this.virtualClock
    );
  }

  sendEvent(service: string, event: string, payload: any) {
    this.eventSynchronizer.sendEvent(service, event, payload);
  }

  getState(service: string): any {
    return this.eventSynchronizer.getState(service);
  }

  advanceTime(time: number) {
    this.virtualClock.advanceTime(time);
  }

  reset() {
    this.eventSynchronizer.reset();
    this.virtualClock.reset();
  }
}
