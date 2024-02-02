![removal ai _a883391b-1088-4b05-b65d-7a74b66c3da6-sest-3](https://github.com/marawan1805/SEST/assets/95961680/3ba983b1-5950-4cc5-b7d6-67d442e21d2b)

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

## Contributing

Please take a moment to review this document in order to make the contribution
process easy and effective for everyone involved.

Following these guidelines helps to communicate that you respect the time of
the developers managing and developing this open source project. In return,
they should reciprocate that respect in addressing your issue or assessing
patches and features.


### Using the issue tracker

The issue tracker is the preferred channel for [bug reports](#bugs),
[features requests](#features) and [submitting pull
requests](#pull-requests), but please respect the following restrictions:

* Please **do not** use the issue tracker for personal support requests (use the
  [Roots Discourse](https://discourse.roots.io/) to ask the Roots Community for help, or if you want the Roots Team to dedicate some time to your issue, we [offer our services](https://roots.io/services/) as well).

* Please **do not** derail or troll issues. Keep the discussion on topic and
  respect the opinions of others.


<a name="bugs"></a>
### Bug reports

A bug is a _demonstrable problem_ that is caused by the code in the repository.
Good bug reports are extremely helpful - thank you!

Guidelines for bug reports:

1. **Use the GitHub issue search** &mdash; check if the issue has already been
   reported.

2. **Check if the issue has been fixed** &mdash; try to reproduce it using the
   latest `master` or development branch in the repository.

3. **Isolate the problem** &mdash; make sure that the code in the repository is
_definitely_ responsible for the issue.

A good bug report shouldn't leave others needing to chase you up for more
information. Please try to be as detailed as possible in your report.


<a name="features"></a>
### Feature requests

Feature requests are welcome. But take a moment to find out whether your idea
fits with the scope and aims of the project. It's up to *you* to make a strong
case to convince the Roots developers of the merits of this feature. Please
provide as much detail and context as possible.


<a name="pull-requests"></a>
### Pull requests

Good pull requests - patches, improvements, new features - are a fantastic
help. They should remain focused in scope and avoid containing unrelated
commits.

**Please ask first** before embarking on any significant pull request (e.g.
implementing features, refactoring code), otherwise you risk spending a lot of
time working on something that the developers might not want to merge into the
project.

Please adhere to the coding conventions used throughout the project (indentation,
comments, etc.).

Adhering to the following this process is the best way to get your work
merged:

1. [Fork](http://help.github.com/fork-a-repo/) the repo, clone your fork,
   and configure the remotes:

   ```bash
   # Clone your fork of the repo into the current directory
   git clone https://github.com/<your-username>//React-Native-Light-Dark-Starter
   # Navigate to the newly cloned directory
   cd /React-Native-Light-Dark-Starter
   # Assign the original repo to a remote called "upstream"
   git remote add upstream https://github.com/<upsteam-owner>//React-Native-Light-Dark-Starter
   ```

2. If you cloned a while ago, get the latest changes from upstream:

   ```bash
   git checkout <dev-branch>
   git pull upstream <dev-branch>
   ```

3. Create a new topic branch (off the main project development branch) to
   contain your feature, change, or fix:

   ```bash
   git checkout -b <topic-branch-name>
   ```

4. Commit your changes in logical chunks. Please adhere to these [git commit
   message guidelines](http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html)
   or your code is unlikely be merged into the main project. Use Git's
   [interactive rebase](https://help.github.com/articles/interactive-rebase)
   feature to tidy up your commits before making them public.

5. Locally merge (or rebase) the upstream development branch into your topic branch:

   ```bash
   git pull [--rebase] upstream <dev-branch>
   ```

6. Push your topic branch up to your fork:

   ```bash
   git push origin <topic-branch-name>
   ```

10. [Open a Pull Request](https://help.github.com/articles/using-pull-requests/)
    with a clear title and description.


