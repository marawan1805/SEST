# SEST (Stateful Event Synchronization Testing)

SEST is a new creative testing method for asynchronous services. This proof-of-concept library focuses on testing asynchronous services by synchronizing the state changes in a controlled environment, which allows for better fault detection and analysis. It's designed to work on top of Jest testing framework and uses TypeScript.

The main idea behind SEST is to mimic a network of microservices, where each service has its own state machine that represents its internal state. Events are sent between these services to trigger state transitions, and the goal of the tests is to verify that these state transitions occur as expected.

SEST includes a fault injector, which can simulate different kinds of faults, such as temporary failures, permanent failures, and message losses, which can help in identifying how your services respond under such circumstances.

## Getting Started

Before diving into SEST, make sure to have `jest` installed as it is a core dependency.

The project's core components include:

- `EventSynchronizer`: Handles the synchronization of events and manages service states.
- `FaultInjector`: Simulates faults in the services.
- `PriorityQueue`: Handles event priority during synchronization.
- `StateMachine`: Represents the state machine for each service.
- `VirtualClock`: Simulates the passage of time for event processing.

## Defining State Machines

SEST requires the definition of state machines to understand the behavior and potential state transitions of your services. The state machine for a service is represented as a TypeScript object with `initialState` and `transitions` properties.

The `initialState` is the state that your service is assumed to be in when testing starts. It's an arbitrary object that should represent the state of your service at rest.

The `transitions` is an array of possible state transitions for your service. Each transition is defined as an object with `event`, `from`, `to`, and `action` properties:

* `event`: The name of the event that triggers this transition.
* `from`: The state(s) that your service should be in for this transition to be possible. It can be a string or an array of strings if the event can occur from multiple states.
* `to`: The state that your service should transition to when this event occurs. It's used for readability and does not affect the functioning of the state machine.
* `action`: A function that takes the current state and the payload of the event and returns the new state. It should not mutate the current state object, but instead create a new one.

Here is an example of how you can define a state machine:

```typescript
import { StateMachine } from "../src/core/StateMachine";

export const ServiceAStateMachine: StateMachine = {
  initialState: { status: "idle", data: null },
  transitions: [
    {
      event: "start",
      from: "idle",
      to: "processing",
      action: (state, payload) => ({
        ...state,
        status: "processing",
        data: payload,
      }),
    },
    {
      event: "finish",
      from: "processing",
      to: "completed",
      action: (state, payload) => ({
        ...state,
        status: "completed",
        data: payload,
      }),
    },
  ],
};
```

## Usage

After defining your state machines, you can follow the steps below to use SEST in your tests:

1. Import the necessary modules in your test file.

```typescript
import { SEST } from "../src/index";
import { ServiceAStateMachine } from "./ServiceAStateMachine";
import { ServiceBStateMachine } from "./ServiceBStateMachine";
import { ServiceCStateMachine } from "./ServiceCStateMachine";
```
2. Initialize the SEST object, passing the state machines for each service.

```typescript
let sest: SEST;

beforeEach(() => {
  sest = new SEST({
    serviceA: ServiceAStateMachine,
    serviceB: ServiceBStateMachine,
    serviceC: ServiceCStateMachine,
  });
});
```
3. Use the sendEvent method to send events to your services. This method returns a promise that resolves once the event has been processed.

```typescript
sest.sendEvent("serviceA", "start", { input: "data" });
```

4. Use the getState method to get the current state of a service.

```typescript
sest.getState("serviceA"); // { status: "processing", data: { input: "data" } }
```
5. The FaultInjector can be used to inject faults into the services.

```typescript
sest.faultInjector.inject("serviceA", "temporaryFailure", {
  duration: 2000,
});
```

## Fault Injection

SEST provides a FaultInjector class which can be used to simulate faults in your services. The following faults can be injected:

- `Temporary Failure`: The service will fail to process events for a specified duration.
- `Permanent Failure`: The service will permanently fail to process events.
- `Message Loss`: The service will lose a specified percentage of events.

## Test Execution

After defining your tests using SEST, run your test suite as you normally would with Jest.

## Limitations

Please note that SEST is a proof-of-concept and may not be suitable for testing all kinds of asynchronous services. It is designed primarily for services that can be represented as state machines and that communicate via events.