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
