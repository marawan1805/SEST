import { StateMachine } from "./StateMachine";

export type ServiceStates = { [key: string]: any };

export type Event = { service: string; event: string; payload: any };

export class EventSynchronizer {
  private stateMachines: { [key: string]: StateMachine };
  private states: ServiceStates;
  private eventQueue: Array<Event>;
  private eventMiddlewares: Array<(event: Event, next: () => void) => void>;

  constructor(stateMachines: { [key: string]: StateMachine }) {
    this.stateMachines = stateMachines;
    this.states = Object.keys(stateMachines).reduce((acc, serviceName) => {
      acc[serviceName] = stateMachines[serviceName].initialState;
      return acc;
    }, {} as ServiceStates);
    this.eventQueue = [];
    this.eventMiddlewares = [];
  }

  sendEvent(service: string, event: string, payload: any): Promise<void> {
    const eventObj: Event = { service, event, payload };
    return new Promise<void>((resolve) => {
      this.processMiddlewares(eventObj, () => {
        this.eventQueue.push(eventObj);
        this.processEventQueue();
        resolve();
      });
    });
  }
  
  getState(service: string): any {
    return this.states[service];
  }

  reset() {
    // Reset the state of each state machine
    for (const stateMachineName in this.stateMachines) {
      const stateMachine = this.stateMachines[stateMachineName];
      stateMachine.initialState = JSON.parse(
        JSON.stringify(stateMachine.initialState)
      );
    }

    // Reset the states of the EventSynchronizer instance
    this.states = Object.keys(this.stateMachines).reduce((acc, serviceName) => {
      acc[serviceName] = this.stateMachines[serviceName].initialState;
      return acc;
    }, {} as ServiceStates);
  }

  registerMiddleware(middleware: (event: Event, next: () => void) => void) {
    this.eventMiddlewares.push(middleware);
  }

  private processEventQueue() {
    while (this.eventQueue.length > 0) {
      const { service, event, payload } = this.eventQueue.shift()!;
      const stateMachine = this.stateMachines[service];
      const currentState = this.states[service];

      const transition = stateMachine.transitions.find(
        (t) => t.event === event && t.from.includes(currentState.status)
      );

      if (transition) {
        this.states[service] = transition.action(currentState, payload);
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
