export type StateTransition = {
  event: string;
  from: string;
  to: string;
  action: (state: any, eventPayload: any) => any;
};

export type StateMachine = {
  initialState: any;
  transitions: Array<StateTransition>;
};