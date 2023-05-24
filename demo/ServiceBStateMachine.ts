import { StateMachine } from "../src/core/StateMachine";

export const ServiceBStateMachine: StateMachine = {
  initialState: { status: "idle", data: null },
  transitions: [
    {
      event: "request",
      from: "idle",
      to: "waiting",
      action: (state, payload) => ({
        ...state,
        status: "waiting",
        data: payload,
      }),
    },
    {
      event: "response",
      from: "waiting",
      to: "completed",
      action: (state, payload) => ({
        ...state,
        status: "completed",
        data: payload,
      }),
    },
  ],
};
