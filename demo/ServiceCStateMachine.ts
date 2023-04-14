import { StateMachine } from "../src/core/StateMachine";

export const ServiceCStateMachine: StateMachine = {
  initialState: { status: "idle", data: null },
  transitions: [
    {
      event: "initialize",
      from: "idle",
      to: "running",
      action: (state, payload) => ({ ...state, status: "running", data: payload }),
    },
    {
      event: "terminate",
      from: "running",
      to: "terminated",
      action: (state, payload) => ({ ...state, status: "terminated", data: payload }),
    },
  ],
};
