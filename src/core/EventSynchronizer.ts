import { StateMachine } from "./StateMachine";
import { PriorityQueue } from "./PriorityQueue";
import { VirtualClock } from "./VirtualClock";

export type ServiceStates = { [key: string]: any };

export type Event = {
  service: string;
  event: string;
  payload: any;
  priority: number;
  processingTime: number | null;
};

export class EventSynchronizer {
  private stateMachines: { [key: string]: StateMachine };
  private states: ServiceStates;
  private eventQueue: PriorityQueue<Event>;
  private eventMiddlewares: Array<(event: Event, next: () => void) => void>;
  private virtualClock: VirtualClock;
  private maxEventsPerSecond: number;

  constructor(
    stateMachines: { [key: string]: StateMachine },
    virtualClock: VirtualClock,
    maxEventsPerSecond: number
  ) {
    this.stateMachines = stateMachines;
    this.states = Object.keys(stateMachines).reduce((acc, serviceName) => {
      acc[serviceName] = stateMachines[serviceName].initialState;
      return acc;
    }, {} as ServiceStates);
    this.eventMiddlewares = [];
    this.eventQueue = new PriorityQueue<Event>(
      (a, b) => a.priority - b.priority || a.processingTime! - b.processingTime!
    );
    this.virtualClock = virtualClock;
    this.maxEventsPerSecond = maxEventsPerSecond;
  }

  sendEvent(
    service: string,
    event: string,
    payload: any,
    priority: number = 1,
    processingTime: number | null = null
  ): Promise<any> {
    const eventObj: Event = {
      service,
      event,
      payload,
      priority,
      processingTime,
    };
    return new Promise<any>((resolve) => {
      this.processMiddlewares(eventObj, () => {
        this.eventQueue.enqueue(eventObj);
        this.processEventQueue(resolve);
      });
    });
  }
  getState(service: string): any {
    return this.states[service];
  }

  reset() {
    for (const stateMachineName in this.stateMachines) {
      const stateMachine = this.stateMachines[stateMachineName];
      stateMachine.initialState = JSON.parse(
        JSON.stringify(stateMachine.initialState)
      );
    }

    this.states = Object.keys(this.stateMachines).reduce((acc, serviceName) => {
      acc[serviceName] = this.stateMachines[serviceName].initialState;
      return acc;
    }, {} as ServiceStates);
  }

  registerMiddleware(middleware: (event: Event, next: () => void) => void) {
    this.eventMiddlewares.push(middleware);
  }

  private processEventQueue(resolve: (value: any) => void) {
    let eventsProcessed = 0;

    while (
      this.eventQueue.length() > 0 &&
      eventsProcessed < this.maxEventsPerSecond
    ) {
      const { service, event, payload, processingTime } =
        this.eventQueue.dequeue()!;
      const stateMachine = this.stateMachines[service];
      const currentState = this.states[service];

      const transition = stateMachine.transitions.find(
        (t) => t.event === event && t.from.includes(currentState.status)
      );

      if (transition) {
        if (processingTime !== null) {
          this.virtualClock.setTimeout(() => {
            this.states[service] = transition.action(currentState, payload);
            resolve(this.getState(service));
          }, processingTime);
        } else {
          this.states[service] = transition.action(currentState, payload);
          resolve(this.getState(service));
        }

        eventsProcessed++;
      } else {
        throw new Error(
          `Invalid transition for service '${service}' with event '${event}'`
        );
      }
    }
  }

  private processMiddlewares(event: Event, next: () => void) {
    const middlewares = [...this.eventMiddlewares];
    const processNextMiddleware = () => {
      if (middlewares.length > 0) {
        const middleware = middlewares.shift()!;
        middleware(event, processNextMiddleware);
      } else {
        next();
      }
    };
    processNextMiddleware();
  }
}
