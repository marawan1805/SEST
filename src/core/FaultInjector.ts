import { EventSynchronizer, Event } from "./EventSynchronizer";
import { VirtualClock } from "./VirtualClock";

export type FaultInjectionOptions = {
  duration?: number;
  lossPercentage?: number;
  latency?: number;
};

export class FaultInjector {
  private eventSynchronizer: EventSynchronizer;
  private virtualClock: VirtualClock;

  constructor(
    eventSynchronizer: EventSynchronizer,
    virtualClock: VirtualClock
  ) {
    this.eventSynchronizer = eventSynchronizer;
    this.virtualClock = virtualClock;
  }

  inject(
    service: string,
    faultType: string,
    options: FaultInjectionOptions = {}
  ) {
    switch (faultType) {
      case "temporaryFailure":
        this.injectTemporaryFailure(service, options.duration || 2000);
        break;
      case "permanentFailure":
        this.injectPermanentFailure(service);
        break;
      case "messageLoss":
        this.injectMessageLoss(service, options.lossPercentage || 10);
        break;
      default:
        throw new Error(`Invalid fault type: '${faultType}'`);
    }
  }

  private injectTemporaryFailure(service: string, duration: number) {
    this.eventSynchronizer.registerMiddleware(
      (event: Event, next: () => void) => {
        if (
          event.service === service &&
          this.virtualClock.getTime() < duration
        ) {
          return;
        }
        next();
      }
    );
  }

  private injectPermanentFailure(service: string) {
    this.eventSynchronizer.registerMiddleware(
      (event: Event, next: () => void) => {
        if (event.service !== service) {
          next();
        }
      }
    );
  }

  private injectMessageLoss(service: string, lossPercentage: number) {
    this.eventSynchronizer.registerMiddleware(
      (event: Event, next: () => void) => {
        if (event.service === service && Math.random() < lossPercentage / 100) {
          return;
        }
        next();
      }
    );
  }
}
