export class ActionRequest {
  actionType: ActionType;
}

export enum ActionType {
  NOOP = "NOOP_ACTION_TYPE",
  HALT = "HALT_ACTION_TYPE",
  PAUSE = "PAUSE_ACTION_TYPE",
  STOP = "STOP_ACTION_TYPE",
  RESEND = "RESEND_LAST_MESSAGE_ACTION_TYPE",
  CONTINUE = "CONTINUE_ACTION_TYPE",
  RESTART = "RESTART_ACTION_TYPE",
}

export class StepByStepRequest {
  enable: boolean;
}

export class NodeStateResponse {
  memberState: string;
  nodeId: string;
  leader: string;
  term: number;
  index: number;
  appliedIndex: number;
  statusError: boolean;
}

export enum NodeState {
  online = 'online',
  paused = 'paused',
  stopped = 'stopped',
}

export class GetStateResponse {
  currentState: string;
  stepByStepMode: boolean;
}

export class LogUpdate {
  logMessage: string;
}

export class UpdateResponse {
  updateType: string;
  updateObject: any;
}
